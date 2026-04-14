import { addDays, addHours, formatISO } from "date-fns";

export function getDefaultEventDates() {
  const start = addDays(new Date(), 10);

  return {
    registrationDeadline: formatISO(addDays(new Date(), 7)),
    startsAt: formatISO(start),
    endsAt: formatISO(addHours(start, 6)),
  };
}
