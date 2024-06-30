import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import s from './styles.module.css';
import { CustomDate } from 'npx-simple-date-picker';

type CalendarProps = {
  nav?: boolean;
  type?: 'week' | 'month';
  activeStartDate?: string;
  dayTxt?: Array<string>;
  onChange?: (selectedDate: string) => void;
};

type ContainerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

type SetCalendarFunction = (selectBtn: 'prev' | 'next') => void;
const DEFAULT_DAYS: string[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function validateDateFormat(date?: string): string {
  if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
    return moment().format('YYYY-MM-DD');
  }
  return date;
}

export const Calendar: React.FC<CalendarProps> = ({
  nav = true,
  type: initialType,
  activeStartDate: initialStandardDate,
  dayTxt = DEFAULT_DAYS,
  onChange,
}) => {
  const today: string = moment().format('YYYY-MM-DD');
  const [type, setType] = useState<'week' | 'month'>(initialType || 'month');
  const [activeStartDate, setStandardDate] = useState<string>(validateDateFormat(initialStandardDate));
  const [selectYear, setSelectYear] = useState<number>(Number(activeStartDate.substring(0, 4)));
  const [selectMonth, setSelectMonth] = useState<number>(Number(activeStartDate.substr(5, 2)));

  useEffect(() => {
    if (onChange) {
      onChange(activeStartDate);
    }
  }, [activeStartDate]);

  const DAYS = dayTxt.map((cls, index) => ({
    cls: DEFAULT_DAYS[index],
    txt: dayTxt[index],
  }));

  const handleCalendarChange = (date: string) => {
    const newYear = Number(date.split('-')[0]);
    const newMonth = Number(date.split('-')[1]);
    const newActiveStartDate = `${date}-01`;

    setSelectYear(newYear);
    setSelectMonth(newMonth);
    setStandardDate(newActiveStartDate);
  };

  const getSelectedYearMonth = () => {
    return `${selectYear}-${selectMonth > 9 ? selectMonth : '0' + selectMonth}`;
  };

  const getThisWeekDays = (date: string): number[] => {
    const startOfWeek = moment(date).startOf('week');
    return Array.from({ length: 7 }, (_, i) => Number(startOfWeek.clone().add(i, 'days').format('DD')));
  };

  const getCalendarCls = (day: number | ''): string => {
    if (typeof day !== 'number' || !day) return '';
    const dayFormatted = getDayFormatted(day);
    return activeStartDate === dayFormatted
      ? 'selected'
      : today === `${getSelectedYearMonth()}-${day > 9 ? day : '0' + day}`
      ? 'today'
      : '';
  };

  const getDayFormatted = (day: number | ''): string => {
    if (typeof day !== 'number' || !day) return '';
    const tmpStandardDate = moment(activeStartDate);
    return tmpStandardDate.date(day).format('YYYY-MM-DD');
  };

  const setCalendar: SetCalendarFunction = (selectBtn) => {
    const newDate =
      selectBtn === 'prev' ? moment(activeStartDate).subtract(1, type) : moment(activeStartDate).add(1, type);
    setSelectYear(newDate.year());
    setSelectMonth(newDate.month() + 1);
    setStandardDate(type === 'month' ? `${newDate.format('YYYY-MM')}-01` : newDate.format('YYYY-MM-DD'));
  };

  const setSelectDate = (selectDate: string) => {
    if (selectDate) {
      const newDate = moment(selectDate);
      setStandardDate(newDate.format('YYYY-MM-DD'));
      setSelectYear(newDate.year());
      setSelectMonth(newDate.month() + 1);
    }
    if (onChange) {
      onChange(selectDate);
    }
  };

  const renderCalendar = () => {
    if (type === 'week') {
      return (
        <table>
          <thead>
            <tr>
              {DAYS.map((day) => (
                <th key={day.cls}>
                  <span className={s[day.cls]}>{day.txt}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {getThisWeekDays(activeStartDate).map((day, index) => (
                <td key={day}>
                  <button
                    className={`${s[DAYS[index % 7].cls]} ${s[getCalendarCls(day)]}`}
                    onClick={() => {
                      setSelectDate(getDayFormatted(day));
                    }}
                  >
                    {day}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      );
    } else if (type === 'month') {
      const thisMonthFirstDay = moment(activeStartDate).startOf('month');
      const startDayWeek = thisMonthFirstDay.day();
      const lastDay = moment(activeStartDate).endOf('month').date();
      const firstDays = Array.from({ length: 7 }, (_, i) => (i < startDayWeek ? '' : i - startDayWeek + 1));

      // 첫째 주의 첫 번째 날짜를 제외한 나머지 날짜를 계산하여 배열 생성
      const remainingDays = Array.from(
        {
          length: Math.ceil((lastDay - firstDays.filter((day) => day !== '').length) / 7),
        },
        (_, i) => {
          const startDay = firstDays.filter((day) => day !== '').length + i * 7 + 1;
          return Array.from({ length: 7 }, (_, index) => startDay + index);
        },
      );

      return (
        <table>
          <thead>
            <tr>
              {DAYS.map((day) => (
                <th key={day.cls}>
                  <span className={s[day.cls]}>{day.txt}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {firstDays.map((day, index) => (
                <td key={`firstDay_${index}`}>
                  <button
                    onClick={() => {
                      setSelectDate(getDayFormatted(day));
                    }}
                    className={`${s[DAYS[index % 7].cls]} ${s[getCalendarCls(day)]}`}
                  >
                    {day}
                  </button>
                </td>
              ))}
            </tr>
            {remainingDays.map((week, week_day_index) => (
              <tr key={`week_${week_day_index}`}>
                {week.map((day, index) => (
                  <td key={`day_${day}`}>
                    <button
                      className={`${s[DAYS[index % 7].cls]} ${s[getCalendarCls(day)]}`}
                      onClick={() => {
                        setSelectDate(getDayFormatted(day));
                      }}
                    >
                      {day <= lastDay ? day : ''}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: 'auto',
      }}
    >
      <div className={s['nav_wrap']}>
        {nav && (
          <button onClick={() => setCalendar('prev')}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        )}
        <CustomDate
          type="month"
          selectedDate={getSelectedYearMonth()}
          showCalendarIcon={false}
          onChange={handleCalendarChange}
          disabled={type === 'week'}
        ></CustomDate>
        {nav && (
          <button onClick={() => setCalendar('next')}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>{renderCalendar()}</div>
    </div>
  );
};

export const Container: React.FC<ContainerProps> = ({ children, style, className }) => {
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};
