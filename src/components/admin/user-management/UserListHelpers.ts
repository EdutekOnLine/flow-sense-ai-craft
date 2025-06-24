
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  workspace_id?: string;
  created_at: string;
}

interface UserWithWorkspace extends User {
  workspace_name?: string;
}

export const getDisplayName = (user: User) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email;
};

export const groupUsersByWorkspace = (
  users: UserWithWorkspace[],
  isRootUser: boolean
): Record<string, UserWithWorkspace[]> => {
  if (isRootUser) {
    return users.reduce((acc, user) => {
      const workspaceKey = user.workspace_name || (user.role === 'root' ? 'Super Users' : 'No Workspace');
      if (!acc[workspaceKey]) acc[workspaceKey] = [];
      acc[workspaceKey].push(user);
      return acc;
    }, {} as Record<string, UserWithWorkspace[]>);
  }
  return { 'All Users': users };
};

export const enhanceUsersWithWorkspaceInfo = (
  users: User[],
  isRootUser: boolean
): UserWithWorkspace[] => {
  if (isRootUser) {
    return users.map(user => ({
      ...user,
      workspace_name: user.workspace_id ? 'Testers' : (user.role === 'root' ? 'Super Users' : 'No Workspace')
    }));
  }
  return users;
};
