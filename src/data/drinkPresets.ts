import { DrinkPreset } from '../types';

export const OFFICIAL_PRESETS: DrinkPreset[] = [
  {
    id: 'specialty-coffee',
    name: '전문점 커피 (아메리카노)',
    defaultAmount: '400mL',
    caffeine: 132,
    category: 'coffee',
    description: '일반 카페 레귤러/톨 사이즈 아메리카노 기준',
    popular: true,
  },
  {
    id: 'canned-coffee',
    name: '커피음료 (캔/페트)',
    defaultAmount: '250mL',
    caffeine: 103,
    category: 'coffee',
    description: '편의점 및 마트의 캔커피 또는 페트병 커피음료',
    popular: true,
  },
  {
    id: 'monster-energy',
    name: '몬스터 에너지',
    defaultAmount: '355mL',
    caffeine: 100,
    category: 'energy',
    description: '대표적인 고카페인 에너지 음료',
    popular: true,
  },
  {
    id: 'energy-drink-std',
    name: '에너지음료 (표준)',
    defaultAmount: '250mL',
    caffeine: 80,
    category: 'energy',
    description: '일반적인 250mL 캔 에너지 음료',
    popular: true,
  },
  {
    id: 'redbull',
    name: '레드불',
    defaultAmount: '250mL',
    caffeine: 63,
    category: 'energy',
    description: '250mL 슬림캔 에너지 음료',
    popular: true,
  },
  {
    id: 'hotsix',
    name: '핫식스',
    defaultAmount: '250mL',
    caffeine: 60,
    category: 'energy',
    description: '국내 대중적 250mL 에너지 음료',
    popular: true,
  },
  {
    id: 'mix-coffee',
    name: '커피믹스 (1봉지)',
    defaultAmount: '1봉지 (12g)',
    caffeine: 56,
    category: 'coffee',
    description: '스틱형 인스턴트 커피믹스 1개',
    popular: true,
  },
  {
    id: 'coffee-milk',
    name: '커피우유 (삼각/팩)',
    defaultAmount: '200mL',
    caffeine: 47,
    category: 'coffee',
    description: '삼각팩 또는 팩 커피우유',
    popular: true,
  },
  // Additional practical student & daily life items
  {
    id: 'ashat-chu',
    name: '아샷추 (아이스티+샷추가)',
    defaultAmount: '450mL',
    caffeine: 120,
    category: 'coffee',
    description: '복숭아 아이스티에 에스프레소 1샷 추가',
    popular: false,
  },
  {
    id: 'green-tea',
    name: '녹차 (티백 1잔)',
    defaultAmount: '200mL',
    caffeine: 28,
    category: 'tea',
    description: '따뜻한 녹차 티백 우린 물 1잔',
    popular: false,
  },
  {
    id: 'cola',
    name: '콜라 (탄산음료)',
    defaultAmount: '250mL',
    caffeine: 24,
    category: 'other',
    description: '일반 콜라 캔 음료 1캔',
    popular: false,
  },
  {
    id: 'choc-milk',
    name: '초콜릿 가공유',
    defaultAmount: '200mL',
    caffeine: 18,
    category: 'other',
    description: '초코우유 속 코코아 유래 카페인',
    popular: false,
  },
  {
    id: 'decaf-coffee',
    name: '디카페인 아메리카노',
    defaultAmount: '350mL',
    caffeine: 5,
    category: 'coffee',
    description: '카페인을 90% 이상 제거한 커피',
    popular: false,
  },
];

export interface ScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  weight: number;
  speed: 'fast' | 'normal' | 'slow';
  drinks: {
    presetId: string;
    drinkName: string;
    amountInfo: string;
    caffeine: number;
    intakeTime: string;
  }[];
}

export const SAMPLE_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'scenario-student',
    title: '시험 기간 청소년',
    subtitle: '아침 등교부터 야간 자율학습까지 섭취',
    badge: '청소년 주의형',
    weight: 55,
    speed: 'normal',
    drinks: [
      {
        presetId: 'coffee-milk',
        drinkName: '커피우유 (삼각/팩)',
        amountInfo: '200mL',
        caffeine: 47,
        intakeTime: '08:10',
      },
      {
        presetId: 'canned-coffee',
        drinkName: '커피음료 (캔/페트)',
        amountInfo: '250mL',
        caffeine: 103,
        intakeTime: '13:30',
      },
      {
        presetId: 'hotsix',
        drinkName: '핫식스',
        amountInfo: '250mL',
        caffeine: 60,
        intakeTime: '19:40',
      },
    ],
  },
  {
    id: 'scenario-cafe',
    title: '주말 오후 카페 나들이',
    subtitle: '점심 식사 후 친구와 카페 1회 이용',
    badge: '안전 루틴형',
    weight: 60,
    speed: 'fast',
    drinks: [
      {
        presetId: 'specialty-coffee',
        drinkName: '전문점 커피 (아메리카노)',
        amountInfo: '400mL',
        caffeine: 132,
        intakeTime: '13:00',
      },
    ],
  },
  {
    id: 'scenario-cramming',
    title: '밤샘 과제/벼락치기',
    subtitle: '늦은 오후와 저녁 연속 에너지음료 폭탄',
    badge: '초과 위험형',
    weight: 50,
    speed: 'slow',
    drinks: [
      {
        presetId: 'monster-energy',
        drinkName: '몬스터 에너지',
        amountInfo: '355mL',
        caffeine: 100,
        intakeTime: '16:00',
      },
      {
        presetId: 'energy-drink-std',
        drinkName: '에너지음료 (표준)',
        amountInfo: '250mL',
        caffeine: 80,
        intakeTime: '20:30',
      },
    ],
  },
];
