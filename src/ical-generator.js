/**
 * 生成iCal格式的日历文件内容
 * @function generateICalFile
 * @param {Array<Object>} matches - 比赛数据数组
 * @param {number} [season=2026] - 赛季年份
 * @returns {string} iCal格式的日历文件内容
 */
export function generateICalFile(matches, season = 2026) {
  if (!matches || matches.length === 0) {
    throw new Error('未提供比赛数据用于生成iCal文件');
  }

  let calData = 
    constant.BEGIN + 
    constant.VERSION + 
    constant.PRODID + 
    constant.CALSCALE + 
    `X-WR-CALNAME:${season}世界杯⚽🏆\n` + 
    constant.APPLE_COLOR;

  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.utcDate) - new Date(b.utcDate)
  );

  const updateTime = moment().tz('Asia/Shanghai').format('YYYY/MM/DD');

  sortedMatches.forEach(match => {
    if (!match.utcDate || !match.homeTeam || !match.awayTeam) {
      console.warn('跳过无效比赛:', match.id);
      return;
    }

    calData += constant.BEGIN_EVENT;

    // 先计算出比分结果
    const matchResult = formatMatchResult(match);

    // 生成包含完场比分的动态标题
    const title = formatMatchTitle(match, matchResult);
    calData += constant.SUMMARY + title + '\n';

    const startTime = moment.utc(match.utcDate).format(TIME_FORMAT) + 'Z';
    const endTime = moment.utc(match.utcDate).add(2, 'hours').format(TIME_FORMAT) + 'Z';
    
    calData += constant.DTSTART + startTime + '\n';
    calData += constant.DTEND + endTime + '\n';

    // 保留系统原生 LOCATION 字段
    if (match.venue) {
      calData += 'LOCATION:' + formatICalText(match.venue) + '\n';
    }

    let description = '';
    
    if (match.stage) {
      description += `阶段: ${getStageName(match.stage)}\n`;
    }
    
    if (match.matchday) {
      description += `轮次: 第${match.matchday}轮\n`;
    }

    if (match.venue) {
      description += `球场: ${match.venue}\n`;
    }

    if (matchResult) {
      description += `比分: ${matchResult}\n`;
    }

    description += `更新时间: ${updateTime}`;
    
    calData += constant.DESCRIPTION + formatICalText(description) + '\n';

    calData += constant.END_EVENT;
  });

  calData += constant.END;

  return calData;
}
