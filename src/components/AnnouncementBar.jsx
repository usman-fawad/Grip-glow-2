import { useCountdown } from '../context/CountdownContext';

export default function AnnouncementBar() {
  const { time } = useCountdown();

  return (
    <div className="ann-bar" role="banner" aria-label="Sale announcement">
      <div className="ann-bar__container">
        {/* Countdown Timer */}
        <div className="ann-bar__timer">
          <span className="ann-bar__text">
            <strong>SALE&nbsp;ENDS</strong>&nbsp;IN
          </span>
          <div
            className="countdown"
            aria-live="polite"
            aria-label={`${time.h} hours ${time.m} minutes ${time.s} seconds`}
          >
            <div className="cd-block">
              <span key={`h-${time.h}`} className="cd-block__num cd-digit-flip">{time.h}</span>
              <span className="cd-block__lbl">HRS</span>
            </div>
            <span className="cd-sep" aria-hidden="true">:</span>
            <div className="cd-block">
              <span key={`m-${time.m}`} className="cd-block__num cd-digit-flip">{time.m}</span>
              <span className="cd-block__lbl">MINS</span>
            </div>
            <span className="cd-sep" aria-hidden="true">:</span>
            <div className="cd-block">
              <span key={`s-${time.s}`} className="cd-block__num cd-digit-flip">{time.s}</span>
              <span className="cd-block__lbl">SECS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
