import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ChildProfile, DailyLog, FoodEntry } from "../types";

const PROFILES_COLLECTION = "profiles";

export const FirestoreService = {
    async createProfile(profile: ChildProfile): Promise<void> {
        const docRef = doc(db, PROFILES_COLLECTION, profile.id);
        await setDoc(docRef, profile);
    },

    async getProfiles(): Promise<ChildProfile[]> {
        const querySnapshot = await getDocs(collection(db, PROFILES_COLLECTION));
        return querySnapshot.docs.map(doc => doc.data() as ChildProfile);
    },

    async getDailyLog(childId: string, date: string): Promise<DailyLog | null> {
        const logRef = doc(db, PROFILES_COLLECTION, childId, "logs", date);
        const logSnap = await getDoc(logRef);

        if (logSnap.exists()) {
            const data = logSnap.data();
            return {
                date: date,
                childId: childId,
                entries: (data.entries || []) as FoodEntry[]
            };
        }
        return null;
    },

    async addFoodEntry(childId: string, date: string, entry: FoodEntry): Promise<void> {
        const logRef = doc(db, PROFILES_COLLECTION, childId, "logs", date);
        const logSnap = await getDoc(logRef);

        if (logSnap.exists()) {
            await updateDoc(logRef, {
                entries: arrayUnion(entry)
            });
        } else {
            await setDoc(logRef, {
                date,
                entries: [entry]
            });
        }
    },

    async deleteFoodEntry(childId: string, date: string, entryId: string): Promise<void> {
        const logRef = doc(db, PROFILES_COLLECTION, childId, "logs", date);
        const logSnap = await getDoc(logRef);

        if (logSnap.exists()) {
            const data = logSnap.data();
            const filteredEntries = (data.entries || []).filter((e: any) => e.id !== entryId);
            await updateDoc(logRef, {
                entries: filteredEntries
            });
        }
    }
};
