import { blockoutPaths } from './blockouts';
import { eventPaths } from './events';
import { healthPaths } from './health';
import { songPaths } from './songs';
import { userPaths } from './users';

export const paths = {
  ...eventPaths,
  ...songPaths,
  ...userPaths,
  ...healthPaths,
  ...blockoutPaths,
};
