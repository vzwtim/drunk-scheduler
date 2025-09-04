import React from 'react';

function Results({ event }) {

  // 最適な日程を計算する
  const calculateBestDate = () => {
    const scores = {};
    event.dates.forEach(date => {
      scores[date] = 0;
    });

    event.responses.forEach(response => {
      event.dates.forEach(date => {
        if (response.attendance[date] === '○') {
          scores[date] += 2; // ○は2点
        } else if (response.attendance[date] === '△') {
          scores[date] += 1; // △は1点
        }
      });
    });

    let bestDate = null;
    let maxScore = -1;

    for (const date in scores) {
      if (scores[date] > maxScore) {
        maxScore = scores[date];
        bestDate = date;
      }
    }
    return bestDate;
  };

  const bestDate = calculateBestDate();

  return (
    <div>
      <h2>3. 出欠状況</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              {event.dates.map(date => (
                <th key={date}>{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {event.responses.map(response => (
              <tr key={response.name}>
                <td>{response.name}</td>
                {event.dates.map(date => (
                  <td key={date}>{response.attendance[date] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bestDate && (
        <div className="best-date">
          <h2>最適日程</h2>
          <p>最も参加者が多い日程は <strong>{bestDate}</strong> です！</p>
        </div>
      )}
    </div>
  );
}

export default Results;
