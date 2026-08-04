import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clipboard,
  Download,
  FileJson,
  Pencil,
  Save,
  Trash2,
  Upload,
  UserRoundCog,
} from 'lucide-react';
import {
  applyBuildProfile,
  BUILD_PROFILE_LIBRARY_STORAGE_KEY,
  BUILD_PROFILE_MAX_COUNT,
  createBuildProfile,
  deleteBuildProfile,
  exportBuildProfile,
  importBuildProfile,
  initialBuildProfileLibrary,
  normalizeBuildProfileLibrary,
  renameBuildProfile,
  updateBuildProfile,
  type BuildProfile,
  type BuildProfileLibrary,
} from '../build-profiles';
import {
  GAME_VISIBLE_TEAM_STORAGE_KEY,
  initialGameVisibleTeamState,
  normalizeGameVisibleTeamState,
  type GameVisibleTeamState,
} from '../game-visible-build';
import { localizedArcName, localizedCharacterName } from '../gameTerms';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface BuildProfileManagerProps {
  team: GameVisibleTeamState;
  locale: 'ru' | 'en';
}

type Notice = { kind: 'ok' | 'error'; text: string } | null;

function randomProfileId(characterName: string): string {
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `profile-${characterName}-${suffix}`;
}

function profileError(error: string, ru: boolean): string {
  const labels: Record<string, { ru: string; en: string }> = {
    'invalid-json': { ru: 'Текст не является корректным JSON.', en: 'The text is not valid JSON.' },
    'invalid-envelope': { ru: 'Это не экспорт профиля NTE поддерживаемой версии.', en: 'This is not a supported NTE profile export.' },
    'checksum-mismatch': { ru: 'Контрольная сумма не совпала: файл изменён или повреждён.', en: 'Checksum mismatch: the file was changed or corrupted.' },
    'invalid-build': { ru: 'В профиле нет корректной сборки известного персонажа.', en: 'The profile does not contain a valid known-character build.' },
    'library-full': { ru: 'В библиотеке уже 50 профилей.', en: 'The library already contains 50 profiles.' },
    'duplicate-character': { ru: 'Этот персонаж уже находится в другом слоте команды.', en: 'This character already occupies another team slot.' },
    'missing-slot': { ru: 'Активный слот команды не найден.', en: 'The active team slot is missing.' },
  };
  return labels[error]?.[ru ? 'ru' : 'en'] ?? (ru ? 'Не удалось выполнить действие.' : 'The action could not be completed.');
}

function profileSummary(profile: BuildProfile, locale: 'ru' | 'en'): string {
  const build = profile.build;
  const arc = build.arc.arcName ? localizedArcName(build.arc.arcName, locale) : (locale === 'ru' ? 'без дуги' : 'no Arc');
  return `${locale === 'ru' ? 'ур.' : 'Lv.'} ${build.level}/${build.maxLevel} · A${build.awakeningLevel} · ${locale === 'ru' ? 'АТК' : 'ATK'} ${build.stats.atk.toLocaleString(locale)} · ${locale === 'ru' ? 'КШ' : 'CR'} ${build.stats.critRate}% · ${arc}`;
}

export function BuildProfileManager({ team, locale }: BuildProfileManagerProps) {
  const ru = locale === 'ru';
  const activeBuild = team.builds[team.activeSlot] ?? team.builds[0]!;
  const [, setStoredTeam] = useLocalStorage<GameVisibleTeamState>(
    GAME_VISIBLE_TEAM_STORAGE_KEY,
    initialGameVisibleTeamState(),
    { normalize: normalizeGameVisibleTeamState },
  );
  const [library, setLibrary] = useLocalStorage<BuildProfileLibrary>(
    BUILD_PROFILE_LIBRARY_STORAGE_KEY,
    initialBuildProfileLibrary(),
    { normalize: normalizeBuildProfileLibrary },
  );
  const [newName, setNewName] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [transferText, setTransferText] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const visibleProfiles = useMemo(() => library.profiles.filter((profile) => (
    showAll || profile.build.characterName === activeBuild.characterName
  )), [activeBuild.characterName, library.profiles, showAll]);

  const saveCurrent = () => {
    const name = newName.trim() || `${localizedCharacterName(activeBuild.characterName, locale)} · ${ru ? 'сборка' : 'build'}`;
    try {
      setLibrary((current) => createBuildProfile(current, activeBuild, name, {
        id: randomProfileId(activeBuild.characterName),
        now: new Date().toISOString(),
      }));
      setNewName('');
      setNotice({ kind: 'ok', text: ru ? 'Сборка сохранена без временных боевых условий.' : 'Build saved without temporary combat conditions.' });
    } catch {
      setNotice({ kind: 'error', text: profileError(library.profiles.length >= BUILD_PROFILE_MAX_COUNT ? 'library-full' : 'invalid-build', ru) });
    }
  };

  const applyProfile = (profile: BuildProfile) => {
    const result = applyBuildProfile(team, team.activeSlot, profile);
    if (!result.ok) {
      setNotice({ kind: 'error', text: profileError(result.error, ru) });
      return;
    }
    setStoredTeam(result.team);
    setNotice({ kind: 'ok', text: ru ? 'Профиль применён; временные эффекты очищены.' : 'Profile applied; temporary effects were cleared.' });
  };

  const updateProfile = (profile: BuildProfile) => {
    if (profile.build.characterName !== activeBuild.characterName) return;
    try {
      setLibrary((current) => updateBuildProfile(
        current,
        profile.id,
        activeBuild,
        draftNames[profile.id] ?? profile.name,
        new Date().toISOString(),
      ));
      setNotice({ kind: 'ok', text: ru ? 'Профиль обновлён из активного слота.' : 'Profile updated from the active slot.' });
    } catch {
      setNotice({ kind: 'error', text: profileError('invalid-build', ru) });
    }
  };

  const renameProfile = (profile: BuildProfile) => {
    try {
      setLibrary((current) => renameBuildProfile(
        current,
        profile.id,
        draftNames[profile.id] ?? profile.name,
        new Date().toISOString(),
      ));
      setNotice({ kind: 'ok', text: ru ? 'Название обновлено.' : 'Name updated.' });
    } catch {
      setNotice({ kind: 'error', text: ru ? 'Название не может быть пустым.' : 'The name cannot be empty.' });
    }
  };

  const removeProfile = (profile: BuildProfile) => {
    const accepted = window.confirm(ru
      ? `Удалить профиль «${profile.name}»?`
      : `Delete profile “${profile.name}”?`);
    if (!accepted) return;
    setLibrary((current) => deleteBuildProfile(current, profile.id));
    setNotice({ kind: 'ok', text: ru ? 'Профиль удалён.' : 'Profile deleted.' });
  };

  const exportProfile = (profile: BuildProfile) => {
    const text = exportBuildProfile(profile);
    setTransferText(text);
    const write = navigator.clipboard?.writeText(text);
    if (!write) {
      setNotice({ kind: 'ok', text: ru ? 'JSON подготовлен в поле ниже.' : 'JSON is ready in the field below.' });
      return;
    }
    void write.then(
      () => setNotice({ kind: 'ok', text: ru ? 'JSON скопирован и оставлен в поле ниже.' : 'JSON copied and left in the field below.' }),
      () => setNotice({ kind: 'ok', text: ru ? 'JSON подготовлен в поле ниже.' : 'JSON is ready in the field below.' }),
    );
  };

  const importProfile = () => {
    const result = importBuildProfile(library, transferText, {
      id: randomProfileId('import'),
      now: new Date().toISOString(),
    });
    if (!result.ok) {
      setNotice({ kind: 'error', text: profileError(result.error, ru) });
      return;
    }
    setLibrary(result.library);
    setDraftNames((current) => ({ ...current, [result.profile.id]: result.profile.name }));
    setNotice({ kind: 'ok', text: ru ? 'Профиль проверен и добавлен в библиотеку.' : 'Profile validated and added to the library.' });
  };

  return <section className="build-profile-manager" aria-label={ru ? 'Профили сборок' : 'Build profiles'}>
    <div className="build-profile-heading"><UserRoundCog size={20} /><div><h3>{ru ? 'Профили сборок' : 'Build profiles'}</h3><p>{ru
      ? 'Хранят реальные введённые данные персонажа. Активные эффекты, цель и временные окна не переносятся.'
      : 'Stores real player-entered character data. Active effects, target state and timed windows are not transferred.'}</p></div><span>{library.profiles.length}/{BUILD_PROFILE_MAX_COUNT}</span></div>

    <div className="build-profile-save">
      <label><span>{ru ? 'Название нового профиля' : 'New profile name'}</span><input value={newName} maxLength={60} onChange={(event) => setNewName(event.target.value)} placeholder={`${localizedCharacterName(activeBuild.characterName, locale)} · ${ru ? 'основная' : 'main'}`} /></label>
      <button type="button" onClick={saveCurrent}><Save size={16} />{ru ? 'Сохранить активную сборку' : 'Save active build'}</button>
    </div>

    <label className="build-profile-filter"><input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} /><span>{ru ? 'Показывать профили всех персонажей' : 'Show profiles for all characters'}</span></label>

    {visibleProfiles.length ? <div className="build-profile-list">{visibleProfiles.map((profile) => {
      const sameCharacter = profile.build.characterName === activeBuild.characterName;
      return <article key={profile.id}>
        <div className="build-profile-name"><b>{localizedCharacterName(profile.build.characterName, locale)}</b><input aria-label={ru ? 'Название профиля' : 'Profile name'} value={draftNames[profile.id] ?? profile.name} maxLength={60} onChange={(event) => setDraftNames((current) => ({ ...current, [profile.id]: event.target.value }))} /></div>
        <p>{profileSummary(profile, locale)}</p>
        <small>{ru ? 'Обновлён' : 'Updated'}: {new Date(profile.updatedAt).toLocaleString(locale)}</small>
        <div className="build-profile-actions">
          <button type="button" onClick={() => applyProfile(profile)}><CheckCircle2 size={14} />{ru ? 'Применить' : 'Apply'}</button>
          <button type="button" disabled={!sameCharacter} title={!sameCharacter ? (ru ? 'Активный слот содержит другого персонажа' : 'The active slot contains another character') : undefined} onClick={() => updateProfile(profile)}><Save size={14} />{ru ? 'Обновить' : 'Update'}</button>
          <button type="button" onClick={() => renameProfile(profile)}><Pencil size={14} />{ru ? 'Переименовать' : 'Rename'}</button>
          <button type="button" onClick={() => exportProfile(profile)}><Clipboard size={14} />{ru ? 'Экспорт' : 'Export'}</button>
          <button type="button" className="danger" onClick={() => removeProfile(profile)}><Trash2 size={14} />{ru ? 'Удалить' : 'Delete'}</button>
        </div>
      </article>;
    })}</div> : <div className="build-profile-empty"><FileJson size={22} /><span>{ru ? 'Для выбранного персонажа профилей пока нет.' : 'There are no profiles for the selected character yet.'}</span></div>}

    <div className="build-profile-transfer">
      <div><Download size={17} /><span><b>{ru ? 'Импорт и экспорт JSON' : 'JSON import and export'}</b><small>{ru ? 'Импорт проверяет версию, контрольную сумму и текущие лимиты полей.' : 'Import validates version, checksum and current field limits.'}</small></span></div>
      <textarea value={transferText} onChange={(event) => setTransferText(event.target.value)} spellCheck={false} placeholder={ru ? 'Вставь сюда экспорт профиля…' : 'Paste a profile export here…'} />
      <button type="button" onClick={importProfile} disabled={!transferText.trim()}><Upload size={16} />{ru ? 'Проверить и импортировать' : 'Validate and import'}</button>
    </div>

    {notice ? <div className={`build-profile-notice ${notice.kind}`}>{notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <FileJson size={16} />}<span>{notice.text}</span></div> : null}
  </section>;
}
