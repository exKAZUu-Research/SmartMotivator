// @flow
/* eslint no-template-curly-in-string: "off" */

import _ from 'lodash';

import { SKELETON_DICTIONARY } from './ja';

export const EN_DICTIONARY = _.merge(SKELETON_DICTIONARY, {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    change: 'Change',
    save: 'Save',
    next: 'Next',
    previous: 'Previous',
    back: 'Return',
    finish: 'Complete',
    enter: 'Decision',
    untitled: 'Untitled',
    add: 'Add',
    name: 'Name',
    delete: 'Delete',
    update: 'Update',
    reset: 'Reset',
    retry: 'Retry',
    login: 'Login',
    confirm: 'Review',
    register: 'Registration',
    validate: 'Authentication',
    send: 'Send',
    sending: 'Sending',
    muted: 'Muted.',
    correctMark: 'o',
    wrongMark: 'X',
    correct: 'Correct answer',
    period: 'Period of time',
    ranking: 'Ranking',
    rival: 'Rival',
    lastBattle: 'Previous results',
    member: 'Members',
    teamName: 'Team name',
    youSuffix: 'You',
    week: 'Week',
    thisWeek: 'This week',
    thisWeekIs: 'This week has',
    nextWeek: 'Next week',
    goal: 'Goal',
    weeklyGoal: 'Goal of the week',
    result: 'Results',
    version: 'Version',
    correctRate: 'Correct answer rate',
    correctCount: 'Number of correct answers',
    answerSpeed: 'Answer speed',
    spentTime: 'Answer time',
    memorized: 'I felt the problem',
    point: 'Point',
    pointWithQCount: '${point} points\n(worth ${count})',
    rank: 'Rank',
    contribution: 'Contribution',
    userDetail: 'User details',
    currentVersion: 'The current version',
    error: 'Error',
    inputPlaceholder: 'Tap to enter',
    impossibleToOpen: 'That could not be opened',
    nowLoading: 'Is loading',
    dataNotFound: 'Data could not be found.',
    usersNotFound: 'User could not be found.',
    connectionErrorTitle: 'Connection error',
    connectionError: 'Unable to connect to the server.',
    saveError: 'Failed to connect to the server. The data could not be saved.',
    dataAcquisitionError: 'Could not retrieve data.',
    connectionErrorAndAcceessLater: 'Cannot connect to the server. After some time passes, please try again.',
    inputCaution: 'Do not enter personal information such as your real name because it is published to all users.',
    unit: {
      correctRate: '%',
      correctCount: 'Q',
      spentTime: ' sec',
      memorized: 'Q',
      point: 'Point',
      questionNumber: 'Q',
      rank: 'th',
      teamName: 'Team',
      user: 'People',
      day: 'Day',
    },
  },
  userModel: {
    name: 'Nickname',
    password: 'Password',
    course: 'Course',
    passcode: 'Passcode',
    email: 'Email address',
    loginId: 'Login ID',
    introduction: 'Profile',
    emptyIntroduction: 'Tap to enter',
    lastAccess: 'Last accessed',
  },
  quizData: {
    english: {
      label: 'English Words ${subLabel}',
      preText: 'Choose the right meaning',
      ngsl_easy_1: '(Easy 1)',
      ngsl_easy_2: '(Easy 2)',
      ngsl_easy_3: '(Easy 3)',
      ngsl_normal_1: '(Normal 1)',
      ngsl_normal_2: '(Normal 2)',
      ngsl_normal_3: '(Normal 3)',
      ngsl_normal_4: '(Normal 4)',
      ngsl_hard: '(Hard)',
    },
  },
  validation: {
    greaterThan: 'greater than ${count} in ${field}',
    lessThanOrEqualTo: 'value of less than ${count} in ${field}',
    tooLong: 'too many characters input ${field} (max ${count})',
  },
  connectionError: {
    badRequest: 'Could not retrieve data.',
    forbidden: 'Could not retrieve data. Update the app.',
    notFound: 'Data was not found. Update the app.',
    internalServerError: 'Could not connect to the server. Please try again later.',
    serviceUnavailable: 'Server is undergoing maintenance. Please try again later.',
    offline: 'Could not connect to the server. Please make sure that you are connected to the Internet.',
  },
  alarm: {
    alarmConfig: {
      pickerTitle: 'Setting the time',
      alarmMessage: 'Now time to learn',
      sameDateError: 'Has set the same time again',
      reminderDescription:
        'Learning is not done by registering a reminder every time, you notice learning time (push notifications).',
      pushPermissionAlert:
        "You cannot be notified by this app. Go to the iPhone's settings and allow notification of smart motivator.",
    },
    alarmMessage: {
      unavailable: 'Time has not been set.',
      available: 'The time is set to ${time}.',
    },
  },
  config: {
    configAvatar: {
      pickColor: 'Choose the color of the icon',
      pickIcon: 'Choose the shape of the icon',
    },
    configMenu: {
      changeName: 'Change your nickname',
      editIntroduction: 'Profile',
      changeAvatar: 'Change icon',
      changeSettings: 'Ability to motivate change',
      changeCourse: 'Change of course',
      changeExpMode: 'Experimental mode changes',
    },
    configProfile: {
      nameCaution: 'Please do not put your real name!',
    },
    configuration: {
      battleFeature: 'Competition',
      battleMode: 'Competition information',
      serious: 'View all',
      casual: 'Only a simple comparison',
      none: 'Do not show',
      weeklyRanking: 'Weekly ranking',
      teamBattle: 'Competition among teams',
      contribution: 'View the contributions within a team',
      rivalLevel: 'The difficulty of the competition',
      easy: 'Friendly',
      normal: 'Usually',
      hard: 'Difficult',
      pointFeature: 'Point',
      pointType: 'Use the point type',
      effortPoint: 'Trying to get points',
      performancePoint: 'Available and to answer points',
      applyRecommendation: 'Use recommended settings',
      recommendationConnectionError: 'Failed to connect to the server and the recommended settings are not set.',
      recommendationSystemError: 'Error occurred on the server while determining the recommended settings.',
    },
  },
  follow: {
    followMain: {
      following: 'Following',
      userSearch: 'Search for users',
    },
    following: {
      noFollowees: "You still don't follow anyone.",
    },
    searchUsers: {
      enterUserName: 'Enter the nickname of the user you want to search for.',
    },
    userDetail: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      mute: 'Mute',
      unmute: 'Mute off',
      dataNote: 'Duration data.',
      followNotificationNote: 'Can you follow does not notify them.',
      muteNotificationNote: 'The mute does not notify them.',
    },
  },
  mcii: {
    common: {
      wishSuffix: 'By',
      outcomeSuffix: 'Get!',
      obstacleSuffix: 'When',
      behaviorSuffix: '.',
    },
    mciiEdit: {
      wish: 'What do you want to achieve?',
      wishDescription:
        'What do you want to achieve by learning with this app? Please write your goals and possible benefits that can be achieved.',
      wishExample: 'Example: take the test at',
      wishSuffix: 'That',
      outcome: 'What you get',
      outcomeDescription: 'But when we get out, what is best for you?',
      outcomeExample: 'Example: the confidence that they can study',
      imagineOutcome: 'If you are finished, it imagine as clearly as possible.',
      obstacle: 'What would cause interference',
      obstacleDescription:
        'What happens as an obstacle in achieving the above? Write your own failures, such as emotional problems or bad habits.',
      obstacleExample: 'Example: while studying, I prefer to read a manga ',
      imagineObstacle: 'After writing that interfere with it imagine as clearly as possible.',
      behavior: 'Action as a measure',
      behaviorDescription: 'When you do a failure, do you learn from the failure?',
      behaviorExample: 'Example: camphor on the Bookshelf comics',
      addObstaclesAndBehaviors: 'Adding to the obstacles and countermeasures',
    },
    mciiList: {
      startMcii: 'Start the MCII',
      editMcii: 'Editing MCII',
      obstacle: 'Failure',
      behavior: 'Measures',
      mciiDescription:
        'Use the method of learning called Mental Contrasting with Implementation Intentions (MCII) with this function, a scientifically validated the effect to continue.',
      deletionAlertTitle: 'Confirm delete',
      deletionAlertBody: 'Are you sure you want to delete?',
      sendAlertTitle: 'MCII data transmission confirmation',
      sendAlertBody:
        'MCII data storage method was changed. Data has been stored only so far, but in the future data is sent to the server as well.\n\nFurthermore, this data is used to improve this app. Select the delete without sending data on a Terminal Server, or to send the data currently stored on the Terminal Server.',
      sendMciiData: 'MCII data sending to server',
      deleteMciiData: 'To remove the MCII data on the device',
      tryMcii: 'Tap here and try to devise learning followed by MCII!',
    },
  },
  point: {
    point: {
      title: 'Class',
      history: 'Available records',
    },
    pointTitle: {
      nextTitleDescription: 'After ${rest} points to the next class',
      shortNextTitleDescription: 'After ${rest} point.',
    },
    pointHistory: {
      time: 'Date and time',
      event: 'Event',
      acquiredPoints: 'Get points',
      howToGetPoints: 'How to obtain the list',
      launchFirst: 'When you start the app for the first time that day',
      launchConsecutively: 'If two or more consecutive, was launched',
      completeQuizSet: 'When I went to learn',
      setupGoal: 'On the status screen, set the goal of the week',
      studyAndCorrect: 'If you answered the quizzes',
      eventDescription: 'Points are obtained by the following actions,',
    },
    pointMessage: {
      currentAndNextTitle: 'It is now 「${title}」. The following class is after ${diff} point.',
      currentTitle: 'It is now 「${title}」.',
    },
  },
  quiz: {
    common: {
      percentage: 'Accuracy of all: ${quizPercentage} %',
    },
    answerButtons: {
      surrenderLarge: "Don't understand",
      surrenderSmall: 'Submission',
    },
    connectionError: {
      errorMessage: 'Cannot connect to the server. After some time passes, please try again.',
    },
    course: {
      prefix: {
        english: 'English words',
        informatics: 'Basic information technology',
      },
      private: {
        english: 'English words',
        informatics: 'Basic information for an exam',
      },
      public: {
        english: 'English words',
        informatics: 'Basic information for an exam',
      },
      mark: {
        tapToNextProblem: 'Tap to next problem',
      },
    },
    itQuiz: {
      title: 'Basic information technicians as ${year} ${season} period am q ${num}.',
      goToCommentary: 'Commentary (Web)',
    },
    itQuizList: {
      shortTitle: '${year}, ${season}.',
      title: 'Basic information technology year ${year} ${season} season',
      questionNumber: 'Q ${num}',
      answerDescription: 'The answer is 「${answer}」',
      checkAnswer: 'See the answer',
    },
    quizFinished: {
      goTop: 'Back to Top',
      studyMore: 'Next Quiz',
      question: 'Problem',
      answer: 'Answer',
      spentTime: 'Time',
      notAnswered: '(Unanswered)',
      incorrectPenalty: 'Precisions less than a 6% penalty',
      barragePenalty: 'Roll penalty',
      correctionNote: 'Compensation: ${value}',
      summaryNote: '${correct} answers, you get ${value} points!',
      resultMessageEffort: 'Finished! ${praise}',
      resultMessagePerformance: '${nCorrect} correct answers! ${praise}',
    },
    quizOpening: {
      startRightNow: 'Started quickly',
    },
    quizMenu: {
      title: 'Change quiz set',
      showDetail: 'Status',
      selected: 'Selected',
      startQuiz: 'Select',
      memorizedQuizList: {
        title: 'I felt the problem',
        noQuizzes: 'No problem.',
        memorized: 'I felt the problem',
        wrong: 'No previous',
        correct: 'Last answer',
        quizHeader: 'Problem',
        quizTitle: 'Have questions ${num} in total',
      },
    },
    quizRunner: {
      questionNumber: 'Q${num}: ',
    },
    lecQuizRunner: {
      correct: 'Correct',
      wrong: 'Errors',
      commentary: 'Commentary',
      showCommentary: 'Read the commentary',
    },
    util: {
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter',
      itQuizName: 'FY ${year} ${season} period am q ${num}.',
    },
    noLeitner: {
      caution: 'Leitner system is not working. Instead randomly selected.',
      start: 'Start',
    },
    mark: {
      tapToNextProblem: 'Tap to next problem',
    },
  },
  ranking: {
    common: {
      topDescriptionIfFirstPlace: 'It is the 1st place! Keep the place.',
      topDescriptionIfTieForFirstPlace: 'It is the 1st place, however shared with someone else! Names: ${names}.',
    },
    ranking: {
      noLastBattle: 'No previous results.',
    },
    pointRanking: {
      title: '${title} rankings',
    },
    rivalRanking: {
      topDescriptionIfUnderFirstPlace:
        'You are rank ${rank}. Continue and with ${pointToOvertake} points, you overtake ${rivalRank} # ${rivalName}!',
    },
    teamRanking: {
      teamContribution: 'Team in contribution',
      topDescriptionIfUnderFirstPlace:
        'You are rank ${rank}. Continue and with ${pointToOvertake} points, you overtake ${rivalRank} in ${rivalName} team!',
    },
    teamRankingDesc: {
      yourTeam: '\nYour team',
      teamBattleDescription:
        'Up to 12 people are divided into three teams and they compete in the total number of correct answers.',
      openWeeklyRanking: 'Open a weekly ranking',
    },
    teamRankingTable: {
      yourPoint: 'your points are ${myPoint}, ${teamName} teams total points.',
    },
  },
  startup: {
    registration: {
      confirmEmail: {
        confirmation: 'To register with the following contents',
        registrationFailure: 'User registration failed. Please try again.',
      },
      confirmName: {
        confirmation: 'With the contents of the following?',
        sendingFailure: 'Failed to send. Please try again.',
      },
      inputEmail: {
        experimentDescription:
          'Please enter the email address of the school. You may provide information collected through this app if the email address is entered on this screen.',
        wrongEmail: 'There is an error in the input',
        enterAppropriateEmail: '@ Please enter the correct email addresses.',
        enterSchoolEmail: 'This email address is not registered. Correctly type the email address of the school.',
      },
      inputName: {
        nameCaution: 'Please do not put your real name!',
      },
      inputPreparedAccount: {
        loginFailure: 'Failed to login.',
        wrongId: 'Login ID is not valid.',
        wrongPassword: 'Password is not correct.',
      },
      menu: {
        signupOrLoginWithEmail: 'Account created or logged in and started',
        loginWithIdAndPassword: 'Log in information was provided in advance',
        signupWithoutEmail: 'Start without creating an account',
      },
      terms: {
        agree: 'You agree to the terms of use and privacy policy',
        alertTitle: 'For additional terms and conditions, etc.',
        alertBody:
          'Privacy policy and terms and conditions of this application has been added. If you confirm and agree press the agree button on the bottom of the screen.',
      },
      validateEmail: {
        passcodeDescription: 'Please enter the passcode sent to ${email}.',
        passcodeLossDescription:
          "The new passcode will be issued. Go back to the previous page if you do not know the passcode and press the 'register' button again.",
        certificationFailure: 'Failed to authenticate. Please check if the passcode is correct.',
      },
    },
  },
  studyHistory: {
    progressMessage: {
      progressPrefix: 'from ${date} your progress',
      comma: 'the',
      progressSuffix: 'It is.',
    },
    studyHistoryChart: {
      chartDescription: 'Set goals, they are displayed in the chart.',
    },
    studyHistory: {
      allTime: '${label} for the whole period',
      allTimeShort: 'Of all time',
      allUsers: 'Amount of all users ${numOfUsers}',
      allUsersShort: '${numOfUsers} users',
      numberCorrectPerWeek: 'Number of correct answers each week',
      rankingPerWeek: 'Each week standings',
      tapToInput: 'Tap to enter',
    },
    studyHistoryTable: {
      notYetAchieved: 'Your goal is after ${diff} q.',
      alreadyAchieved: 'Congratulations! Goal achieved!',
    },
  },
  survey: {
    common: {
      surveyDescription:
        'The questions measure the psychological tendency on your willingness, please fill out a simple questionnaire. Based on your answers, we recommend features for this app that will help you learning.',
      agreementDescription: 'If you agree with the above, go into the answers.',
      startSurvey: 'Start answer',
      thankYou: 'Thank you very much for your help',
    },
    postSurvey: {
      surveySendingFailure: 'Could not send the questionnaire.',
      accessLater:
        "Cannot connect to the server.\nAfter some time passes, please open this page again. You don't need to answer the questionnaire again.",
      sendingSurvey: 'Sending survey',
    },
    preSurvey: {
      startApplication: 'Get started using the app',
      surveySendingFailure:
        'Failed to send the questionnaire. After confirming that you are online again, press "start application".',
      pleaseWait: 'Transmitting data. Please wait for a while.',
    },
    surveyQuestion: {
      notApplicable: 'Especially without',
      AnswerRandomlyForTests: 'All appropriate answer (for testing)',
    },
  },
  calendar: {
    dateChange: '${year}, ${month}.',
    notes: {
      quizzes: 'The overall done quizzes of the day ${total},\n whereas ${correct} answers were correct.',
      quizzesTitle: 'Learning history',
      points: 'Points earned on this ${pointsDay}\n, total points were ${pointsTotal}.',
      pointsTitle: 'Point',
    },
  },
  mission: {
    common: {
      answerTitle: '${num} answers',
      correctTitle: '${num} correct',
      fastCorrectTitle: '${num} correct in ${threshold} sec',
      memorizedTitle: '${num} memorized',
      progress: '${value} left',
    },
    mission: {
      pointUnit: 'point',
      level: 'Level ${level}',
      bonus: '(Bonus: 💎x${bonus})',
      listLegend: 'Goals (reset everyday)',
      seeRankingMore: 'See more',
      seeHistory: 'See history',
      levelUpModal: {
        title: 'Level Up!',
        level: 'Level ${level}',
        point: 'Requirement: ${point} or more',
        bonus: '💎 Bonus: x${beforeBonus} -> x${afterBonus}',
      },
      rankUpModal: {
        title: 'Rank Up!',
      },
      calendarModal: {
        description: "You've achieved today's goal. Keep it up!",
      },
    },
    calendar: {
      yearMonth: 'MMMM YYYY',
    },
    missionHistory: {
      missionCount: 'Achieved goals',
      totalPoint: 'Total points',
      achievedTime: 'Time',
      missionName: 'Goal',
      point: 'Point',
      noRecord: 'No record',
    },
    missionRanking: {
      positiveFramingMessage: 'Get ${approxPoint} to beat ${rank}th place 💪',
      negativeFramingMessage: 'Get ${approxPoint} or lose to ${rank}th place 😰',
      firstRankMessage: "You're 1st place 🎉",
    },
    myRanking: {
      title: 'Self High Score Ranking (hourly)',
      positiveFramingMessage: 'Get ${approxPoint} to beat ${rank}th place 💪',
      negativeFramingMessage: 'Get ${approxPoint} or lose to ${rank}th place 😰',
      firstRankMessage: "You've got a high score 🎉",
    },
    level: {
      positiveFramingMessage: 'Get ${approxPoint} to level up 💪',
      negativeFramingMessage: 'Get ${approxPoint} or no level up 😰',
    },
  },
  newTop: {
    newTop: {
      memorizedCount: 'I felt the issue number',
      answeredCount: 'Number of problems solved.',
      startQuiz: 'Start Quiz',
      changeQuiz: 'Change',
      welcome: "There's the ${name}",
      starDescription: '★ favorite feature, press [...] and it will be shown here.',
      checkAttendance: 'Check Attendance',
      genreInfo: 'Memorized: ${memorized}  Correct: ${correct}  [All: ${all}]',
    },
    firstConfig: {
      pleaseSetup: 'See the configuration mechanisms used in this app.',
      start: 'Start using the app with these settings',
    },
  },
  appRoot: {
    updateDialog: {
      title: 'App updates',
      updateMessage: 'Update the app. After the update is complete, restart the app.',
      descriptionPrefix: '\n\n======== 更新内容 ========\n',
    },
    updatingAppError:
      'Error occurred while checking for updates. Make sure you are connected to the network. Try again.',
    gettingDataError: 'Could not connect to the server. Make sure you are connected to the network. Try again.',
  },
  about: {
    terms: 'Use and privacy policy terms',
    promotionDescription:
      'Features within the app is different for each user. May change to different features while using the app.',
    defaultContact:
      'If you have questions or problems, please contact us to the email address.',
    contactTeacher: 'Ask your teacher.',
    forumDescriptionWithSecretPassword:
      'More boards are below your question. Passwords to the Board are announced in advance.',
    forumDescriptionWithRawPassword: 'More boards below your question. ${password} is the password to the Board.',
    forumDescription: 'More boards below your question.',
    contactEmail: 'Alternatively, please contact us to the email address below.',
    aboutInquiry: 'How to contact us',
    aboutEnglishWords: 'Problems with Word',
    aboutWordList:
      'Created a word problem is the following word list (NGSL 1.01) from removing simple words. And is designed to NGSL can cover 92% of General English, rated high academically.',
  },
  achievementHelper: {
    effortPraises: [
      "You're doing good job 😃",
      'Nice work ✨',
      "You're trying hard 👍",
      "You're learning a lot 😊",
      'Keep it up 💪',
    ],
    performancePraises: [
      "You've got a good score 😃",
      'Good performance ✨',
      'You remember well 👍',
      "You're good at learning 😊",
      'Keep up the good score 💪',
    ],
    launchFirstWithPoint: 'Today is the first app launch! ${point} points GET ✨ ✨',
    launchFirstWithoutPoint: 'Today is the first app launch!',
    launchFirstLabel: 'App launch',
    launchConsecutivelyWithPoint: '${count} consecutives day launched! Add ${point} points GET ✨ ✨',
    launchConsecutivelyWithoutPoint: '${count} consecutive days app used!',
    launchConsecutivelyLabel: 'Start app series',
    solveAllQuizzesCorrectly: 'We answer all the questions!',
    completeQuizSetWithoutPoint: 'Has been completed!',
    completeQuizSetWithPoint: 'Completed quiz set ${point} points GET ✨ ✨',
    completeQuizSetLabel: 'Quiz answers',
    completeQuizSetBonusWithPoint: 'Completed quiz set ${point} points GET ✨ ✨',
    completeQuizSetBonusLabel: 'Quiz answer + bonus',
    setupMcii: 'MCII is set!',
    setupGoalWithPoint: 'set goal of ${weekWord}! ${point} points GET ✨ ✨',
    setupGoalWithoutPoint: 'set goal of ${weekWord}!',
    setupGoalLabel: 'Goal setting / ${type}',
    reachGoal: 'achieving the target value of ${type}!',
    getTitle: 'Got a class 「${title}」!',
  },
  titleHelper: {
    title: 'Level ${level}',
  },
  footer: {
    text: '${point} points / ${title}',
  },
  storageViewer: {
    dataResetAlert: 'Are you sure you want to reset the data?',
    keyDeletionAlert: 'are you sure you want to delete ${key}?',
  },
  top: {
    topTitle: 'List of features',
    studyTitle: 'Learning',
    quizSetTitle: 'Past Quizzes review',
    studyHistoryTitle: 'Weekly progress',
    studyHistoryDescription: 'Looking back on the weekly results, set up the goal.',
    postQuestionnaireTitle: 'Questionnaire',
    postQuestionnaireDescription: 'Thank you for your participation in the experiment. Do the survey to help us.',
    battleTitle: 'Weekly ranking',
    battleDefaultDescription: 'To win the battle, solve a lot of quizzes!',
    pointTitle: 'Point and class',
    pointDefaultDescription: 'You can earn a class!',
    pointHistoryTitle: 'Points get records',
    pointRankingTitle: 'Point Ranking',
    pointRankingDescription: 'Point Ranking Description',
    followTitle: 'Follow',
    followDescription: 'To follow other users, search them here.',
    MCIITitle: 'MCII',
    MCIIDefaultDescription: 'Continue learning the scientific method.',
    calendarTitle: 'Daily progress',
    calendarDescription: "Let's look the daily results.",
    reminderTitle: 'Reminder',
    configTitle: 'Setting',
    aboutTitle: 'About this app',
    storageTitle: 'Storage',
    storageDescription: 'For debugging! Confirm saved settings',
    message: {
      star: 'Added to the top',
      unstar: 'Disappeared from the top',
    },
    starDescription: '好きな機能に★を付けると、トップ画面にショートカットのアイコンが表示されます。',
    calendarModalTitle: "Let's achieve today's goals!",
    calendarModalDescription: 'Date is colored if you achieve a goal.',
  },
  progress: {
    remainingDays:
      'The remaining ${diffDays} days ${diffHours} hours, (${startMonth} / ${startDay} /-${endMonth} / ${endDay} /)',
    remainingQuizzes: 'After success with ${number} (${correctCount} / ${goalCorrectCount})',
    succeeded: 'Success! (${correctCount} / ${goalCorrectCount})',
  },
});
