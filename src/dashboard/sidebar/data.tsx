import { HomeIcon } from './icons/HomeIcon';
import { NetworksIcon } from './icons/NetworksIcon';
import { GroupsIcon } from './icons/GroupsIcon';
import { MonitoringIcon } from './icons/MonitoringIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ResourcesIcon } from './icons/ResourcesIcon';
import { ConnectorIcon } from './icons/ConnectorIcon';
import {PolicyIcon} from './icons/PolicyIcon';
export const data = [
  {
    title: 'Home',
    icon: <HomeIcon />,
    link: '/',
  },
  {
    title: 'Networks',
    icon: <NetworksIcon />,
    link: '/networks',
  },
  {
    title: 'Connectors',
    icon: <ConnectorIcon />,
    link: '/connectors',
  },
  {
    title: 'Resources',
    icon: <ResourcesIcon />,
    link: '/resources',
  },
  // {
  //   title: 'Monitoring',
  //   icon: <MonitoringIcon />,
  //   link: '/monitoring',
  // },
  {
    title: 'Users',
    icon: <UsersIcon />,
    link: '/users',
  },
  {
    title: 'Groups',
    icon: <GroupsIcon />,
    link: '/groups',
  },
  {
    title: 'Policies',
    icon: <PolicyIcon />,
    link: '/policies',
  }
];
