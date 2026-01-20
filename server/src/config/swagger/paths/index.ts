import { blockoutPaths } from './blockouts';
import { eventPaths } from './events';
import { healthPaths } from './health';
import { orgPaths } from './orgs';
import { songPaths } from './songs';
import { teamPaths } from './teams';
import { userPaths } from './users';

export const paths = {
  ...eventPaths,
  ...songPaths,
  ...userPaths,
  ...healthPaths,
  ...blockoutPaths,
  ...orgPaths,
  ...teamPaths,
};
