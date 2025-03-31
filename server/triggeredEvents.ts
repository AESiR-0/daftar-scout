import { sendNotification } from "./wss";

export const notifyScoutCreated = () => {
  sendNotification("A new scout has been created!");
};

export const notifyPitchCreated = () => {
  sendNotification("A new pitch has been created!");
};
