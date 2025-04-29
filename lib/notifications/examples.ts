import { createNotification } from './insert';
import { sendWelcomeEmail } from './listen';
import { NotificationType, NotificationRole } from './type';

// Example 1: Welcome Email for New Users
export async function sendNewUserWelcome(userEmail: string, userName: string) {
  await sendWelcomeEmail(userEmail, userName);
}

// Example 2: Pitch Team Invite
export async function sendPitchTeamInvite(
  targetUserId: string,
  currentUser: {
    id: string;
    name: string;
    designation: string;
  },
  pitch: {
    id: string;
    name: string;
    videoUrl: string;
    videoThumbnail: string;
  },
  invitedUser: {
    name: string;
    designation: string;
  }
) {
  await createNotification({
    type: "updates",
    role: "founder",
    title: "Team Invitation",
    description: `You've been invited to join the pitch team for ${pitch.name}`,
    targeted_users: [targetUserId],
    payload: {
      pitchId: pitch.id,
      pitchName: pitch.name,
      currentUsername: currentUser.name,
      currentUserDesignation: currentUser.designation,
      invitedUsername: invitedUser.name,
      invitedUserDesignation: invitedUser.designation,
      videoUrl: pitch.videoUrl,
      videoThumbnail: pitch.videoThumbnail,
      joinedTime: new Date().toISOString(),
    },
  });
}

// Example 3: Daftar Team Invite
export async function sendDaftarTeamInvite(
  targetUserId: string,
  currentUser: {
    id: string;
    name: string;
    designation: string;
  },
  daftar: {
    id: string;
    name: string;
  },
  invitedUser: {
    name: string;
    designation: string;
  }
) {
  await createNotification({
    type: "updates",
    role: "investor",
    title: "Daftar Team Invitation",
    description: `You've been invited to join the daftar team ${daftar.name}`,
    targeted_users: [targetUserId],
    payload: {
      daftar_id: daftar.id,
      daftarName: daftar.name,
      currentUsername: currentUser.name,
      currentUserDesignation: currentUser.designation,
      invitedUsername: invitedUser.name,
      designation: invitedUser.designation,
      joinedTime: new Date().toISOString(),
    },
  });
}

// Example 4: Scout Collaboration Invite
export async function sendScoutCollaborationInvite(
  targetUserId: string,
  currentUser: {
    id: string;
    name: string;
    designation: string;
  },
  scout: {
    id: string;
    name: string;
    url: string;
  },
  daftar: {
    id: string;
    name: string;
  }
) {
  await createNotification({
    type: "scout_link",
    role: "both",
    title: "Scout Collaboration Invitation",
    description: `You've been invited to collaborate on the scout ${scout.name}`,
    targeted_users: [targetUserId],
    payload: {
      scout_id: scout.id,
      scoutName: scout.name,
      openScoutUrl: scout.url,
      daftarName: daftar.name,
      currentUsername: currentUser.name,
      currentUserDesignation: currentUser.designation,
      joinedTime: new Date().toISOString(),
    },
  });
}

// Example 5: Standard News Notification
export async function sendNewsNotification(
  targetUserIds: string[],
  message: string,
  url?: string
) {
  await createNotification({
    type: "news",
    role: "both",
    title: "News Update",
    description: message,
    targeted_users: targetUserIds,
    payload: {
      message,
      url,
    },
  });
}

// Example 6: Alert Notification
export async function sendAlertNotification(
  targetUserIds: string[],
  message: string,
  role: NotificationRole = "both"
) {
  await createNotification({
    type: "alert",
    role,
    title: "Important Alert",
    description: message,
    targeted_users: targetUserIds,
    payload: {
      message,
    },
  });
}

// Example 7: Request Notification
export async function sendRequestNotification(
  targetUserId: string,
  currentUser: {
    id: string;
    name: string;
  },
  requestType: string,
  message: string
) {
  await createNotification({
    type: "request",
    role: "both",
    title: `New ${requestType} Request`,
    description: message,
    targeted_users: [targetUserId],
    payload: {
      action_by: currentUser.id,
      action_at: new Date().toISOString(),
      message,
    },
  });
} 