export const generateTimeSlots = (
  date: string,
  startTime: string,
  endTime: string,
  sessionTime: number, 
  meditationTime: number 
) => {
  const slots = [];
  let current = new Date(`${date}T${startTime}`);
  const endLimit = new Date(`${date}T${endTime}`);
  
  const slotDuration = sessionTime + meditationTime;
  const gapBetweenSlots = 15; 

  const totalJump = slotDuration + gapBetweenSlots;

  while (new Date(current.getTime() + slotDuration * 60000) <= endLimit) {
    const sTime = current.toTimeString().slice(0, 5);
    
    // Calculate Slot End Time (includes meditation)
    const slotEnd = new Date(current.getTime() + slotDuration * 60000);
    const eTime = slotEnd.toTimeString().slice(0, 5);

    slots.push({
      startTime: sTime,
      endTime: eTime,
    });

    // Move start time forward by (Total Session + Meditation + 15m Gap)
    current = new Date(current.getTime() + totalJump * 60000);
  }

  return slots;
};