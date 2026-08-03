import AsyncStorage from '@react-native-async-storage/async-storage';

import { INITIAL_DEAS } from '@/data/mock';
import { createZoneRequest, fetchActiveZones, fetchPublicDeas } from '@/services/api';
import type {
  CardioSafeZone,
  ContactInquiryInput,
  DeaLocation,
  DeaSubmissionInput,
  User,
  ZoneSubmissionInput,
} from '@/types';

const USERS_KEY = 'lex_users';
const SESSION_KEY = 'lex_session';
const DEAS_KEY = 'lex_deas';
const INQUIRIES_KEY = 'lex_inquiries';

interface StoredUser extends User {
  password: string;
}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

async function writeUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function readDeas(): Promise<DeaLocation[]> {
  const raw = await AsyncStorage.getItem(DEAS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(DEAS_KEY, JSON.stringify(INITIAL_DEAS));
    return INITIAL_DEAS;
  }

  return JSON.parse(raw) as DeaLocation[];
}

async function writeDeas(deas: DeaLocation[]) {
  await AsyncStorage.setItem(DEAS_KEY, JSON.stringify(deas));
}

export async function getPublicDeas(): Promise<DeaLocation[]> {
  try {
    return await fetchPublicDeas();
  } catch {
    const deas = await readDeas();
    return deas.filter((dea) => dea.isPublic && dea.status === 'operativo');
  }
}

export async function getActiveZones(): Promise<CardioSafeZone[]> {
  try {
    return await fetchActiveZones();
  } catch {
    return [];
  }
}

export async function getAllDeas(): Promise<DeaLocation[]> {
  return readDeas();
}

export async function getUserDeas(userId: string): Promise<DeaLocation[]> {
  const deas = await readDeas();
  return deas.filter((dea) => dea.submittedByUserId === userId);
}

export async function registerUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<User> {
  const users = await readUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  const user: StoredUser = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    email: normalizedEmail,
    phone: input.phone?.trim(),
    password: input.password,
  };

  users.push(user);
  await writeUsers(users);
  await AsyncStorage.setItem(SESSION_KEY, user.id);

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const users = await readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (candidate) => candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  await AsyncStorage.setItem(SESSION_KEY, user.id);
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function logoutUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionId = await AsyncStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    return null;
  }

  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === sessionId);
  if (!user) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }

  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function submitCommunityDea(input: DeaSubmissionInput): Promise<DeaLocation> {
  const deas = await readDeas();
  const newDea: DeaLocation = {
    id: `dea-user-${Date.now()}`,
    name: input.name.trim(),
    address: input.address.trim(),
    description: input.description?.trim(),
    coordinates: input.coordinates,
    source: 'comunitario',
    status: 'pendiente',
    isPublic: false,
    accessHours: input.accessHours?.trim(),
    contactName: input.contactName.trim(),
    contactPhone: input.contactPhone.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    swornDeclarationAccepted: false,
    createdAt: new Date().toISOString(),
  };

  deas.push(newDea);
  await writeDeas(deas);
  return newDea;
}

export async function submitContactInquiry(input: ContactInquiryInput): Promise<void> {
  const raw = await AsyncStorage.getItem(INQUIRIES_KEY);
  const inquiries = raw ? JSON.parse(raw) : [];
  inquiries.push({
    ...input,
    id: `inquiry-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
}

export async function submitZoneIncorporation(input: ZoneSubmissionInput): Promise<void> {
  await createZoneRequest(input);
}

export async function addLexDea(input: DeaSubmissionInput): Promise<DeaLocation> {
  const deas = await readDeas();
  const newDea: DeaLocation = {
    id: `dea-lex-${Date.now()}`,
    name: input.name.trim(),
    address: input.address.trim(),
    description: input.description?.trim(),
    coordinates: input.coordinates,
    source: 'lex',
    status: 'operativo',
    isPublic: true,
    accessHours: input.accessHours?.trim(),
    contactName: input.contactName.trim(),
    contactPhone: input.contactPhone.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    swornDeclarationAccepted: false,
    createdAt: new Date().toISOString(),
  };

  deas.push(newDea);
  await writeDeas(deas);
  return newDea;
}
