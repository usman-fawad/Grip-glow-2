import { useCountdown } from '../context/CountdownContext';

function RollingDigit({ slot }) {
  const { curr, prev, gen } = slot;
  const isRolling = gen > 0;

  return (
    <span className="cd-digit-slot" aria-hidden="true">
      <span key={gen} className={`cd-digit-roller${isRolling ? ' is-rolling' : ''}`}>
        {isRolling && <span className="cd-digit-item">{prev}</span>}
        <span className="cd-digit-item">{curr}</span>
      </span>
    </span>
  );
}

export default function AnnouncementBar() {
  const { time, digits } = useCountdown();

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
            aria-label={`${time.h} hours ${time.m} minutes ${time.s} seconds`}
          >
            <div className="cd-block">
              <span className="cd-block__num">
                <span className="sr-only">{time.h}</span>
                <RollingDigit slot={digits.h0} />
                <RollingDigit slot={digits.h1} />
              </span>
              <span className="cd-block__lbl">HRS</span>
            </div>
            <span className="cd-sep" aria-hidden="true">:</span>
            <div className="cd-block">
              <span className="cd-block__num">
                <span className="sr-only">{time.m}</span>
                <RollingDigit slot={digits.m0} />
                <RollingDigit slot={digits.m1} />
              </span>
              <span className="cd-block__lbl">MINS</span>
            </div>
            <span className="cd-sep" aria-hidden="true">:</span>
            <div className="cd-block">
              <span className="cd-block__num">
                <span className="sr-only">{time.s}</span>
                <RollingDigit slot={digits.s0} />
                <RollingDigit slot={digits.s1} />
              </span>
              <span className="cd-block__lbl">SECS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
