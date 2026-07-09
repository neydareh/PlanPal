import { blockoutPaths } from './blockouts';
import { eventPaths } from './events';
import { healthPaths } from './health';
import { invitePaths } from './invites';
import { orgPaths } from './orgs';
import { songPaths } from './songs';
import { teamPaths } from './teams';
import { userPaths } from './users';

export const paths = {
  ...eventPaths,
  ...songPaths,
  ...userPaths,
  ...healthPaths,
  ...invitePaths,
  ...blockoutPaths,
  ...orgPaths,
  ...teamPaths,
};
