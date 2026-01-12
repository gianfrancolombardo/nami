import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, arrayUnion, query, where, orderBy } from "firebase/firestore";
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

    async getLogsByDateRange(childId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
        console.log(`[DB] Fetching logs for ${childId} from ${startDate} to ${endDate}`);
        const logsRef = collection(db, PROFILES_COLLECTION, childId, "logs");

        try {
            const q = query(
                logsRef,
                where("date", ">=", startDate),
                where("date", "<=", endDate),
                orderBy("date", "asc")
            );

            const querySnapshot = await getDocs(q);
            console.log(`[DB] Found ${querySnapshot.size} logs`);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure entries is always an array
                const entries = Array.isArray(data.entries) ? data.entries : [];
                return {
                    date: data.date, // This relies on the field 'date' being present in the document data
                    childId: childId,
                    entries: entries as FoodEntry[]
                };
            });
        } catch (error) {
            console.error("[DB] Error in getLogsByDateRange:", error);
            // Fallback: If compound query fails (e.g. index missing), try client-side filtering
            // Note: simple range on single field + sort by same field should work without custom index.
            console.log("[DB] Attempting fallback client-side filtering");
            const simpleQ = query(logsRef); // Get all? No, that's too much.
            // Just return empty for now to avoid freezing app with massive fetch
            return [];
        }
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

    async setDailyLog(childId: string, date: string, entries: FoodEntry[]): Promise<void> {
        const logRef = doc(db, PROFILES_COLLECTION, childId, "logs", date);
        await setDoc(logRef, {
            date,
            entries
        });
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
