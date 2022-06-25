import { $dateToString } from '../../expression/string';
import { $project } from '../aggregate-stage';

export default function formatDate() {
  return {
    [$project]: {
      _id: 0,
      dt: {
        [$dateToString]: {
          format: "%Y-%m-%d",
          date: { $dateFromString: { dateString: "$d" } },
        },
      },
    },
  };
}