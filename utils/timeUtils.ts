// utils/timeUtils.ts

export const parseTime = (timeStr: string): Date => {
    const date = new Date();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${hours}:${minutesStr} ${ampm}`;
};

export const generateTimeSlots = (timeRange: string): string[] => {
    try {
        const slots: string[] = [];
        const [startTimeStr, endTimeStr] = timeRange.split(' - ');
        if (!startTimeStr || !endTimeStr) return [];

        let currentTime = parseTime(startTimeStr.trim());
        const endTime = parseTime(endTimeStr.trim());
        
        while (currentTime < endTime) {
            slots.push(formatTime(currentTime));
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        return slots;
    } catch (e) {
        console.error("Error parsing time slots:", e);
        return [];
    }
};
