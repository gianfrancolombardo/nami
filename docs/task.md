# Task Checklist - Firebase Integration and Improvements

- [ ] **Planning**
    - [ ] Create `implementation_plan.md` <!-- id: 0 -->
    - [ ] Design Firestore Data Model <!-- id: 1 -->

- [ ] **Environment & Config**
    - [ ] Create `.env` file with Firebase placeholders <!-- id: 2 -->
    - [ ] Install `firebase` dependency <!-- id: 3 -->
    - [ ] Create `src/firebaseConfig.ts` <!-- id: 4 -->

- [ ] **Persistence Layer**
    - [ ] Create `src/services/db.ts` (Firestore logic) <!-- id: 5 -->
        - [ ] Profile methods (`createProfile`, `getProfiles`)
        - [ ] Daily Log methods (`getDailyLog`, `addFoodEntry`)

- [ ] **App Integration**
    - [ ] Refactor `App.tsx` to use `db.ts` instead of local state <!-- id: 6 -->
    - [ ] Implement `useEffect` for initial data loading <!-- id: 7 -->

- [ ] **Food Database Expansion (AI)**
    - [ ] Create a script/utility `scripts/populateDB.ts` (conceptual or functional) to expand food list <!-- id: 8 -->
    - [ ] Expand `constants.ts` with 50+ common toddler foods (using AI generation) <!-- id: 9 -->

- [ ] **UI Improvements**
    - [ ] Add loading indicators for async operations <!-- id: 10 -->
    - [ ] Improve "Generar Receta" button state <!-- id: 11 -->

- [ ] **Verification**
    - [ ] Verify data persistence on reload <!-- id: 12 -->
    - [ ] Verify Food DB expansion <!-- id: 13 -->
