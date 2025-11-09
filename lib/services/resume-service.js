import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { createEmptyResume } from "@/lib/models/resume";

function userResumesCollection(userId) {
  return collection(firestore, COLLECTIONS.RESUMES, userId, "items");
}

function resumeDoc(userId, resumeId) {
  return doc(firestore, COLLECTIONS.RESUMES, userId, "items", resumeId);
}

function clone(value) {
  if (value == null) return value;
  try {
    return structuredClone(value);
  } catch (error) {
    return JSON.parse(JSON.stringify(value));
  }
}

function buildContentSnapshot(content = {}) {
  const empty = createEmptyResume();
  return {
    basics: clone(content.basics) || empty.basics,
    experience: clone(content.experience) || empty.experience,
    education: clone(content.education) || empty.education,
    skills: clone(content.skills) || empty.skills,
    projects: clone(content.projects) || empty.projects,
    status: content.status || empty.status,
  };
}

function mapResumeDoc(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    title: data.title || "Untitled",
    ownerId: data.ownerId || "",
    fileURL: data.fileURL || "",
    fileName: data.fileName || "",
    fileType: data.fileType || "",
    fileSize: data.fileSize || 0,
    filePath: data.filePath || "",
    parsedText: data.parsedText || "",
    status: data.status || "draft",
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : null,
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate().toISOString()
      : null,
    uploadedAt: data.uploadedAt?.toDate
      ? data.uploadedAt.toDate().toISOString()
      : null,
    content: buildContentSnapshot(data.content),
  };
}

export async function fetchUserResumes(userId) {
  if (!userId) {
    return [];
  }
  const resumesQuery = query(
    userResumesCollection(userId),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(resumesQuery);
  return snapshot.docs.map(mapResumeDoc);
}

export async function createUserResume(userId) {
  const empty = createEmptyResume();
  const content = buildContentSnapshot(empty);
  const docRef = await addDoc(userResumesCollection(userId), {
    ownerId: userId,
    title: "Untitled",
    fileURL: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    filePath: "",
    parsedText: "",
    content,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    uploadedAt: null,
  });
  return docRef.id;
}

export async function updateUserResumeTitle(userId, resumeId, title) {
  await updateDoc(resumeDoc(userId, resumeId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function updateResumeContent(userId, resumeId, content) {
  const snapshot = buildContentSnapshot(content);
  await updateDoc(resumeDoc(userId, resumeId), {
    content: snapshot,
    status: snapshot.status || "draft",
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserResumeById(userId, resumeId) {
  if (!userId || !resumeId) {
    throw new Error("Resume identifier is missing.");
  }
  const docSnap = await getDoc(resumeDoc(userId, resumeId));
  if (!docSnap.exists()) {
    throw new Error("Resume not found.");
  }
  return mapResumeDoc(docSnap);
}

export async function deleteUserResume(userId, resumeId) {
  if (!userId || !resumeId) {
    throw new Error("Resume identifier is missing.");
  }
  const docRef = resumeDoc(userId, resumeId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data?.filePath) {
      try {
        await deleteObject(ref(storage, data.filePath));
      } catch (error) {
        console.warn("Failed to delete file from storage", error);
      }
    }
  }
  await deleteDoc(docRef);
}
