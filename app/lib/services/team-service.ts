import { driveService } from '../google-drive.server';
import { TeamMember } from '@/app/types/team';
import { v4 as uuidv4 } from 'uuid';

export const teamService = {
  async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      const team = await driveService.getCollection<TeamMember>('users');
      console.log('Team members from Drive:', team);
      return team;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    try {
      const team = await this.getAllTeamMembers();
      const member = team.find((m) => m.id === id);
      return member || null;
    } catch (error) {
      console.error('Error finding team member:', error);
      return null;
    }
  },

  async createTeamMember(
    memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TeamMember> {
    const team = await this.getAllTeamMembers();

    const newMember: TeamMember = {
      id: uuidv4(),
      ...memberData,
      assignment: memberData.assignment || [],
      progress: memberData.progress || '0%',
      attendance: memberData.attendance || '100%',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    team.push(newMember);
    await driveService.saveCollection('team', team);

    return newMember;
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    const team = await this.getAllTeamMembers();
    const memberIndex = team.findIndex((m) => m.id === id);

    if (memberIndex === -1) return null;

    team[memberIndex] = {
      ...team[memberIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await driveService.saveCollection('team', team);
    return team[memberIndex];
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    const team = await this.getAllTeamMembers();
    const filteredTeam = team.filter((m) => m.id !== id);

    if (filteredTeam.length === team.length) return false;

    await driveService.saveCollection('team', filteredTeam);
    return true;
  },

  // Assignment management
  async addAssignment(memberId: string, assignment: string): Promise<TeamMember | null> {
    const member = await this.getTeamMemberById(memberId);
    if (!member) return null;

    const assignments = member.assignment || [];
    assignments.push(assignment);

    return this.updateTeamMember(memberId, { assignment: assignments });
  },

  async removeAssignment(memberId: string, assignmentIndex: number): Promise<TeamMember | null> {
    const member = await this.getTeamMemberById(memberId);
    if (!member) return null;

    const assignments = member.assignment || [];
    assignments.splice(assignmentIndex, 1);

    return this.updateTeamMember(memberId, { assignment: assignments });
  },

  // Update attendance
  async updateAttendance(memberId: string, attendance: string): Promise<TeamMember | null> {
    return this.updateTeamMember(memberId, { attendance });
  },

  // Update progress
  async updateProgress(memberId: string, progress: string): Promise<TeamMember | null> {
    return this.updateTeamMember(memberId, { progress });
  },
};
