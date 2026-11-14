import "./WeatherAlerts.css";
import {
  WEATHER_INFO,
  getWeather,
  getForecast,
  getAlerts,
} from "./missionData";

const LEVEL_ICON = {
  critical: "🚨",
  warning: "⚠️",
  info: "ℹ️",
  ok: "✅",
};

function WeatherAlerts({ missionDay, resources }) {
  const weather = getWeather(missionDay);
  const info = WEATHER_INFO[weather];
  const forecast = getForecast(missionDay, 3);
  const alerts = getAlerts(missionDay, resources);
  const activeAlerts = alerts.filter((alert) => alert.level !== "ok").length;
  const weatherClass = weather.toLowerCase().replace(/ /g, "-");

  return (
    <section className="wa-section">
      {/* WEATHER */}
      <div className="wa-card">
        <div className="wa-heading">
          <p className="wa-tag">MARS WEATHER</p>
          <span className="wa-sol">SOL {missionDay}</span>
        </div>

        <div className="wa-weather-main">
          <div className="wa-weather-icon">{info.icon}</div>
          <div>
            <h3>{weather}</h3>
            <p>{info.note}</p>
          </div>
        </div>

        <div className="wa-solar">
          <div className="wa-solar-top">
            <span>SOLAR OUTPUT</span>
            <strong>{info.solar}%</strong>
          </div>
          <div className="wa-bar">
            <div
              className={`wa-bar-fill ${weatherClass}`}
              style={{ width: `${info.solar}%` }}
            ></div>
          </div>
        </div>

        <p className="wa-label">FORECAST</p>
        <div className="wa-forecast">
          {forecast.length === 0 && (
            <p className="wa-empty">No forecast. The mission ends soon.</p>
          )}

          {forecast.map((item) => (
            <div className="wa-forecast-item" key={item.sol}>
              <span>SOL {item.sol}</span>
              <div>{WEATHER_INFO[item.weather].icon}</div>
              <small>{item.weather}</small>
            </div>
          ))}
        </div>
      </div>

      {/* ALERTS */}
      <div className="wa-card">
        <div className="wa-heading">
          <p className="wa-tag">EMERGENCY ALERTS</p>
          <span className={`wa-count ${activeAlerts > 0 ? "active" : ""}`}>
            {activeAlerts} ACTIVE
          </span>
        </div>

        <div className="wa-alerts">
          {alerts.map((alert, index) => (
            <div className={`wa-alert ${alert.level}`} key={index}>
              <span className="wa-alert-icon">{LEVEL_ICON[alert.level]}</span>
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WeatherAlerts;