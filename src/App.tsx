import { subscribeToData, saveData } from './utils/storage';

// Inside your component:
useEffect(() => {
  const unsubscribe = subscribeToData((latestData) => {
    // Update your state with latestData
    // This fires instantly when ANYONE saves
  });
  return () => unsubscribe();
}, []);

// Your save button handler:
const handleSaveAll = async () => {
  await saveData(yourCurrentData);
  // All devices receive it instantly now
};
