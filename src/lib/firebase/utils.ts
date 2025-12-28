import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from ".";

export const uploadFileToFirebase = async (
  audioData: Uint8Array | ArrayBuffer | Blob,
  filePath: string,
) => {
  // Make a reference for file to upload
  const storageRef = ref(storage, filePath);

  // Upload file
  return await uploadBytes(storageRef, audioData);
};

export const uploadJsonToFirebase = async (
  jsonData: object,
  filePath: string,
) => {
  const storageRef = ref(storage, filePath);
  const jsonString = JSON.stringify(jsonData);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  await uploadBytes(storageRef, data);
};

export const downloadJsonFromFirebase = async (filePath: string) => {
  try {
    const url = await getDownloadURL(ref(storage, filePath));
    const response = await fetch(url);
    return await response.json();
  } catch {
    return null;
  }
};

export const createFirebaseUrl = async (fullPath: string): Promise<string> => {
  // Return download URL
  return await getDownloadURL(ref(storage, fullPath));
};

export const checkIfAudioHasAlreadyBeenSynthesized = async (
  filePath: string,
) => {
  try {
    // Return URL for download
    return await getDownloadURL(ref(storage, filePath));
  } catch {
    return false;
  }
};
