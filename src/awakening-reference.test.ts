import { describe, expect, it } from 'vitest';
import {
  allAwakeningNodes,
  awakeningNodesForCharacter,
  awakeningReferenceByCharacter,
  awakeningSearchText,
  relevantAwakeningNodes,
  teamEffectAwakeningRequirements,
  teamEffectIdsForAwakeningNode,
} from './awakening-reference';

describe('central Awakening reference', () => {
  it('combines 48 sourced nodes across eight covered characters', () => {
    expect(allAwakeningNodes).toHaveLength(48);
    expect([...awakeningReferenceByCharacter.keys()].sort()).toEqual([
      'Chaos',
      'Haniel',
      'Jiuyuan',
      'Lacrimosa',
      'Nanally',
      'Sakiri',
      'Shinku',
      'Zero',
    ]);
    for (const nodes of awakeningReferenceByCharacter.values()) {
      expect(nodes.map((node) => node.level)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it('returns no Calculator requirements when the current formula has no dependency', () => {
    expect(relevantAwakeningNodes('Shinku', undefined, [])).toEqual([]);
    expect(relevantAwakeningNodes('Chaos', 'chaos.remora-enhancement.base-five-seconds', [])).toEqual([]);
    expect(relevantAwakeningNodes('Haniel', undefined, ['haniel.friendship.nova-atk-drain'])).toEqual([]);
  });

  it('returns only the exact action-linked node', () => {
    const nanally = relevantAwakeningNodes('Nanally', 'nanally.awakening-three-follow-up.level-11', []);
    const zeroA1 = relevantAwakeningNodes('Zero', 'zero.blooming-gaze.awakening-one', []);
    const zeroA6 = relevantAwakeningNodes('Zero', 'zero.appraise-and-engrave-extra.awakening-six', []);
    const jiuyuanA6 = relevantAwakeningNodes('Jiuyuan', 'jiuyuan.know-every-secret.awakening-six', []);

    expect(nanally.map((node) => node.level)).toEqual([3]);
    expect(nanally[0]?.title.ru).toBe('Называйте меня боссом');
    expect(zeroA1.map((node) => node.level)).toEqual([1]);
    expect(zeroA6.map((node) => node.level)).toEqual([6]);
    expect(jiuyuanA6.map((node) => node.level)).toEqual([6]);
    expect(jiuyuanA6[0]?.title.en).toBe('Know Every Secret');
  });

  it('links Sakiri A4 to the enabled verified team effect', () => {
    expect(teamEffectAwakeningRequirements).toEqual([{
      effectId: 'sakiri.awakening-four.team-atk',
      characterName: 'Sakiri',
      level: 4,
    }]);
    const required = relevantAwakeningNodes('Sakiri', undefined, ['sakiri.awakening-four.team-atk']);
    expect(required.map((node) => node.level)).toEqual([4]);
    expect(required[0]?.title.ru).toBe('Жажда уверенности');
    expect(teamEffectIdsForAwakeningNode(required[0]!)).toEqual(['sakiri.awakening-four.team-atk']);
  });

  it('keeps unrelated effect IDs and other characters from creating false requirements', () => {
    expect(relevantAwakeningNodes('Sakiri', undefined, ['sakiri.impish-trick.def-reduction'])).toEqual([]);
    expect(relevantAwakeningNodes('Haniel', undefined, ['sakiri.awakening-four.team-atk'])).toEqual([]);
    expect(teamEffectIdsForAwakeningNode(awakeningNodesForCharacter('Sakiri')[2]!)).toEqual([]);
  });

  it('makes Awakening titles and descriptions searchable from the Character Database', () => {
    const sakiri = awakeningSearchText('Sakiri');
    const zero = awakeningSearchText('Zero');
    const shinku = awakeningSearchText('Shinku');
    const jiuyuan = awakeningSearchText('Jiuyuan');

    expect(sakiri).toContain('Жажда уверенности');
    expect(sakiri).toContain('30% базовой Атаки Сакири');
    expect(zero).toContain('Цветущий взгляд');
    expect(shinku).toContain('Dragon\'s Treasure');
    expect(jiuyuan).toContain('Know Every Secret');
    expect(jiuyuan).toContain('5 секунд');
    expect(awakeningSearchText('Hathor')).toBe('');
  });
});
