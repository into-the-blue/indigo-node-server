import { TMemberType } from '@/types';

export const mapTypeToNum = (type: TMemberType) => {
  switch (type) {
    case 'lifelongMember': {
      return 0;
    }
    case 'sponsor':
    case 'friend': {
      return 1;
    }
    case '30': {
      return 2;
    }
    case '14': {
      return 3;
    }
    case '5':
      return 4;
  }
};

/**
 *
 *
 * @param {TMemberType} type1
 * @param {TMemberType} type2
 * @returns
 * if type1 is a superior member type
 */
export const compareMemberType = (type1: TMemberType, type2: TMemberType) => {
  return mapTypeToNum(type1) <= mapTypeToNum(type2);
};
