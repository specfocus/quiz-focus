import { $dateFromParts } from '../../expression/date';
import { $project } from '../aggregate-stage';

export default function trucateDate(dateField: string) {
  const $dateField = "$".concat(dateField);
  return {
    [$project]: {
      _id: 0,
      roundDate: {
        [$dateFromParts]: {
          year: { $year: $dateField },
          month: { $month: $dateField },
          day: { $dayOfMonth: $dateField },
        },
      },
    },
  };
};
