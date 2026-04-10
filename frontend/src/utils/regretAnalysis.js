/**
 * Future Regret Simulator Logic
 * Rule-based pattern analysis for regret prediction
 */

/**
 * Analyze patterns and calculate regret probability
 * @param {Object} data - Usage data including entries, stats, risk scores
 * @returns {Object} Regret analysis results
 */
export const analyzeRegretPatterns = (data) => {
  const { entries, dailyAvg, lateNightFrequency, intentDriftFrequency, riskScoreTrend, honestyScore } = data;

  let regretScore = 0;
  const regretTypes = {
    attentionDrain: 0,
    burnout: 0,
    habitualScrolling: 0
  };

  // Factor 1: Average daily usage (0-30 points)
  if (dailyAvg >= 240) { // 4+ hours
    regretScore += 30;
    regretTypes.attentionDrain += 20;
    regretTypes.burnout += 10;
  } else if (dailyAvg >= 180) { // 3-4 hours
    regretScore += 20;
    regretTypes.attentionDrain += 15;
    regretTypes.burnout += 5;
  } else if (dailyAvg >= 120) { // 2-3 hours
    regretScore += 10;
    regretTypes.attentionDrain += 10;
  }

  // Factor 2: Late-night usage frequency (0-25 points)
  if (lateNightFrequency >= 0.5) { // 50%+ of sessions
    regretScore += 25;
    regretTypes.burnout += 20;
    regretTypes.habitualScrolling += 5;
  } else if (lateNightFrequency >= 0.3) { // 30-50%
    regretScore += 15;
    regretTypes.burnout += 15;
  } else if (lateNightFrequency >= 0.15) { // 15-30%
    regretScore += 8;
    regretTypes.burnout += 8;
  }

  // Factor 3: Intent drift frequency (0-25 points)
  if (intentDriftFrequency >= 0.6) { // 60%+ didn't find what they wanted
    regretScore += 25;
    regretTypes.habitualScrolling += 20;
    regretTypes.attentionDrain += 5;
  } else if (intentDriftFrequency >= 0.4) { // 40-60%
    regretScore += 15;
    regretTypes.habitualScrolling += 15;
  } else if (intentDriftFrequency >= 0.2) { // 20-40%
    regretScore += 8;
    regretTypes.habitualScrolling += 8;
  }

  // Factor 4: Risk score trend (0-10 points)
  if (riskScoreTrend === 'increasing') {
    regretScore += 10;
    regretTypes.attentionDrain += 5;
    regretTypes.burnout += 5;
  } else if (riskScoreTrend === 'stable_high') {
    regretScore += 5;
    regretTypes.habitualScrolling += 5;
  }

  // Factor 5: Digital honesty score (0-10 points)
  if (honestyScore < 60) {
    regretScore += 10;
    regretTypes.habitualScrolling += 5;
  } else if (honestyScore < 80) {
    regretScore += 5;
  }

  // Clamp regret score to 0-100
  regretScore = Math.min(100, Math.max(0, regretScore));

  // Determine regret level
  let regretLevel = 'low';
  if (regretScore >= 70) regretLevel = 'high';
  else if (regretScore >= 40) regretLevel = 'medium';

  // Determine dominant regret type
  const dominantType = Object.keys(regretTypes).reduce((a, b) => 
    regretTypes[a] > regretTypes[b] ? a : b
  );

  return {
    regretScore,
    regretLevel,
    regretTypes,
    dominantType
  };
};

/**
 * Generate letter from 30-year-old self
 * @param {Object} analysis - Regret analysis results
 * @param {Object} stats - Current usage statistics
 * @returns {string} Letter text
 */
export const generateFutureLetter = (analysis, stats) => {
  const { regretLevel, dominantType } = analysis;
  const { dailyAvg, totalDays } = stats;

  const templates = {
    attentionDrain: {
      high: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

I wish I had realized sooner how much of my attention I was giving away. Those ${Math.round(dailyAvg)} minutes a day added up to ${Math.round((dailyAvg * 365) / 60)} hours a year—time I could have spent learning, creating, or connecting with people who mattered.

The constant scrolling trained my brain to seek quick hits of dopamine instead of deep focus. Now, when I try to read a book or have a meaningful conversation, my mind wanders. I'm paying the price for those years of fragmented attention.

If I could go back, I'd set strict boundaries. I'd ask myself: "Is this serving me?" before every open. I'd delete the apps that made me feel empty and keep only the ones that added real value.

Your future self`,
      medium: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

I see the patterns now. Those hours scrolling weren't rest—they were avoidance. I was using apps to escape from things I should have been facing.

The habit of reaching for my phone whenever I felt bored or anxious became automatic. I didn't realize I was training myself to be uncomfortable with stillness, with my own thoughts.

Looking back, I wish I'd been more intentional. I wish I'd tracked not just how much time I spent, but why I was spending it. The awareness would have changed everything.

Your future self`,
      low: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

You're doing better than most, but there's still room to be more intentional. Those moments of mindless scrolling add up, and they train your brain to seek constant stimulation.

The key isn't to eliminate social media—it's to use it with purpose. Before you open an app, ask: "What am I looking for?" If you can't answer, close it.

Your future self`
    },
    burnout: {
      high: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

The late nights scrolling weren't rest—they were stealing my rest. I'd stay up until 2 AM, thinking I was relaxing, but I was actually keeping my brain in a state of hyperarousal.

The blue light, the endless content, the comparison trap—it all added up. I'd wake up tired, reach for my phone, and the cycle would start again. I didn't realize I was creating my own exhaustion.

I wish I'd set a hard cutoff time. I wish I'd put my phone in another room. I wish I'd understood that true rest requires stillness, not stimulation.

Your future self`,
      medium: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

I see now how those late-night sessions were affecting my sleep quality. Even when I thought I was "winding down" with my phone, I was actually keeping my mind active.

The habit of checking one more thing, watching one more video, scrolling one more feed—it never felt like much in the moment. But over time, it eroded my ability to truly rest.

I wish I'd been more protective of my evenings. I wish I'd created a buffer between screen time and sleep time. Your future self will thank you for it.

Your future self`,
      low: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

You're mostly doing well, but pay attention to those late-night sessions. Even occasional late scrolling can disrupt your sleep patterns and leave you feeling less rested.

Consider setting a "phone bedtime" an hour before your actual bedtime. Give your brain time to wind down naturally.

Your future self`
    },
    habitualScrolling: {
      high: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

I opened apps without knowing why. I'd tell myself I was looking for something specific, but then I'd scroll for 30 minutes and forget what I came for. That wasn't browsing—that was autopilot.

The pattern became so automatic that I didn't even notice I was doing it. My hand would reach for my phone, my thumb would open an app, and I'd be scrolling before I'd made a conscious decision.

I wish I'd asked myself more often: "Did I find what I was looking for?" The answer was usually no, and that should have been a red flag.

Your future self`,
      medium: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

I see the pattern now—opening apps with intention but then getting lost in the feed. I'd go in looking for one thing and come out 20 minutes later, having consumed content I never intended to see.

The gap between intention and action grew wider over time. I'd tell myself I was being productive or social, but I was really just scrolling on autopilot.

I wish I'd been more honest with myself about what I was actually doing. Tracking my intentions helped, but only if I paid attention to the results.

Your future self`,
      low: `Dear ${totalDays > 0 ? 'Past' : 'Present'} Me,

You're mostly intentional, but there are still moments of autopilot scrolling. Those moments add up. The key is awareness—noticing when you're scrolling without purpose and choosing to stop.

Before you open an app, pause. Ask yourself: "What am I looking for?" If you can't answer, don't open it.

Your future self`
    }
  };

  return templates[dominantType]?.[regretLevel] || templates.attentionDrain.low;
};

/**
 * Generate "Things You Wish You Stopped Earlier" list
 * @param {Object} analysis - Regret analysis results
 * @param {Object} stats - Usage statistics
 * @returns {Array} List of things to stop
 */
export const generateRegretList = (analysis, stats) => {
  const { regretTypes, dominantType } = analysis;
  const { lateNightFrequency, intentDriftFrequency, dailyAvg } = stats;

  const items = [];

  if (lateNightFrequency > 0.3) {
    items.push('Late-night scrolling that disrupted your sleep');
  }

  if (intentDriftFrequency > 0.4) {
    items.push('Opening apps without a clear purpose');
  }

  if (dailyAvg > 180) {
    items.push('Spending 3+ hours a day on social media');
  }

  if (regretTypes.habitualScrolling > 15) {
    items.push('Mindless scrolling on autopilot');
  }

  if (regretTypes.attentionDrain > 15) {
    items.push('Fragmented attention from constant app switching');
  }

  if (regretTypes.burnout > 15) {
    items.push('Using apps as a form of "rest" that actually exhausted you');
  }

  if (stats.repeatedOpens > 5) {
    items.push('Checking the same apps multiple times per day');
  }

  if (items.length === 0) {
    items.push('Not being more intentional about your digital habits');
  }

  return items;
};
