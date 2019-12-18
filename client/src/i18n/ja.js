// @flow
/* eslint no-template-curly-in-string: "off" */

import _ from 'lodash';

export const JA_DICTIONARY = {
  common: {
    // verbs
    ok: 'OK',
    start: 'スタート',
    cancel: 'キャンセル',
    change: '変更',
    save: '保存',
    next: '次へ',
    previous: '前へ',
    back: 'もどる',
    finish: '完了',
    enter: '決定',
    untitled: '未設定',
    add: '追加',
    name: '名前',
    delete: '削除',
    update: 'アップデート',
    reset: 'リセット',
    retry: 'リトライ',
    login: 'ログイン',
    confirm: '確認',
    register: '登録',
    validate: '認証',
    send: '送信',
    sending: '送信中',
    muted: 'ミュート中です。', // nouns
    correctMark: 'o',
    wrongMark: '✕',
    correct: '正解',
    period: '期間',
    ranking: 'ランキング',
    rival: 'ライバル',
    lastBattle: '前回の結果',
    member: 'メンバー',
    teamName: 'チーム名',
    youSuffix: '（あなた）',
    week: '週',
    thisWeek: '今週',
    thisWeekIs: '今週は',
    nextWeek: '来週',
    goal: '目標',
    weeklyGoal: '今週の目標',
    result: '結果',
    version: 'バージョン',
    quizCount: '問題数',
    correctRate: '正解率',
    correctCount: '正解数',
    answerSpeed: '解答速度',
    spentTime: '解答時間',
    memorized: '覚えた問題',
    correctQuiz: '正解した問題',
    answered: '解いた問題',
    point: 'ポイント',
    pointWithQCount: '${point}点\n(${count}問相当)',
    rank: '順位',
    contribution: '貢献度',
    userDetail: 'ユーザー詳細',
    currentVersion: '現在のバージョン',
    mission: '目標',
    error: 'エラー', // message
    inputPlaceholder: 'タップして入力',
    impossibleToOpen: 'は開けませんでした',
    nowLoading: 'ロード中です。',
    dataNotFound: 'データが見つかりません。',
    usersNotFound: 'ユーザーが見つかりません。',
    connectionErrorTitle: '接続エラー',
    connectionError: 'サーバーに接続できません。',
    saveError: 'サーバーへの接続に失敗したため、データを保存できませんでした。',
    dataAcquisitionError: 'データが取得できませんでした。',
    connectionErrorAndAcceessLater: '現在サーバーに接続できません。しばらく時間をおいて試してください。',
    inputCaution: '入力内容は全ユーザーに公開されるため、本名などの個人情報を入力しないでください。',
    openAppStore: 'ストアを開く',
    unit: {
      correctRate: '%',
      correctCount: '問',
      spentTime: '秒',
      avgSpentTime: '秒/問',
      memorized: '問',
      point: '点',
      questionNumber: '問',
      rank: '位',
      teamName: 'チーム',
      user: '人',
      day: '日',
    },
  }, // Models
  userModel: {
    name: 'ニックネーム',
    password: 'パスワード',
    course: 'コース',
    passcode: 'パスコード',
    email: 'メールアドレス',
    loginId: 'ログインID',
    introduction: 'プロフィール',
    emptyIntroduction: 'よろしく',
    lastAccess: '最終アクセス',
    correctCount: '正答数',
  },
  quizData: {
    english: {
      label: '英単語 ${subLabel}',
      preText: '単語の意味を答えなさい',
      ngsl_easy_1: '初級１',
      ngsl_easy_2: '初級２',
      ngsl_easy_3: '初級３',
      ngsl_normal_1: '中級１',
      ngsl_normal_2: '中級２',
      ngsl_normal_3: '中級３',
      ngsl_normal_4: '中級４',
      ngsl_hard: '上級',
    },
  },
  validation: {
    // ref: https://github.com/svenfuchs/rails-i18n/blob/master/rails/locale/ja.yml
    greaterThan: '${field}は${count}より大きい値にしてください',
    lessThanOrEqualTo: '${field}は${count}以下の値にしてください',
    tooLong: '${field}は${count}文字以内で入力してください',
  },
  connectionError: {
    badRequest: 'データが取得できませんでした。',
    forbidden: 'データが取得できませんでした。\nストアからアプリのアップデートをしてください。',
    notFound: 'データが見つかりませんでした。\nストアからアプリのアップデートをしてください。',
    internalServerError: 'サーバーに接続できませんでした。\nしばらく時間をおいてから、再試行してください。',
    serviceUnavailable: 'サーバーをメンテナンス中です。\nしばらく時間をおいてから、再試行してください。',
    offline: 'サーバーに接続できませんでした。\nインターネットに接続できるかご確認ください。',
  }, // Components
  alarm: {
    alarmConfig: {
      pickerTitle: '時刻の設定',
      alarmMessage: '学習する時刻になりました',
      sameDateError: '同じ時刻が設定されています',
      reminderDescription:
        'リマインダーを登録すると、毎日指定した時刻までに学習が行われていない場合、学習時刻のお知らせ（プッシュ通知）が表示されます。',
      pushPermissionAlert:
        '本アプリの通知が許可されていないため、リマインダーが利用できません。iPhoneの設定から、スマートモチベーターの通知を許可してください。',
    },
    alarmMessage: {
      unavailable: '時刻が設定されていません。',
      available: '設定時刻は ${time} です。',
    },
  },
  config: {
    configAvatar: {
      pickColor: 'アイコンの色を選ぶ',
      pickIcon: 'アイコンの形を選ぶ',
    },
    configMenu: {
      changeName: 'ニックネームの変更',
      editIntroduction: '一言プロフィール',
      changeAvatar: 'アイコンの変更',
      changeSettings: 'やる気を引き出す機能の変更',
      changeLocale: '言語の変更',
      changeCourse: 'コースの変更 (dev)',
      dateOffset: '日付の変更 (dev)',
      changeExpMode: '実験モードの変更 (dev)',
      resetStudyHistory: '覚えた問題をリセット',
    },
    configProfile: {
      nameCaution: '本名は入れないでください！',
    },
    configuration: {
      applyRecommendation: 'あなたにオススメの設定にする',
      recommendationConnectionError: 'サーバーへの接続に失敗したため、設定をオススメできませんでした。',
      recommendationSystemError: 'オススメ設定の決定中にサーバーでエラーが発生しました。',
    },
    resetStudyHistory: {
      description:
        'これまでに学習し、覚えた問題の内容が全てリセットされます。\n(ポイントや学習履歴等には影響がありません。)',
      notification: '一度リセットした場合、元に戻せませんのでご注意ください。',
      resetText: 'リセットする',
      confirmReset: '本当にリセットしてもよろしいですか？',
      succeedToReset: 'リセットしました。',
      failToReset: 'リセットに失敗しました。',
    },
  },
  follow: {
    followMain: {
      following: 'フォロー中',
      userSearch: 'ユーザーをさがす',
    },
    following: {
      noFollowees: 'あなたはまだ、だれもフォローしていません。',
    },
    searchUsers: {
      enterUserName: 'さがしたいユーザーのニックネームを入力してください。',
    },
    userDetail: {
      follow: 'フォロー',
      unfollow: 'フォロー解除',
      mute: 'ミュート',
      unmute: 'ミュート解除',
      dataNote: '全期間のデータです',
      followNotificationNote: 'フォローしていることは相手に通知されません。',
      muteNotificationNote: 'ミュートしていることは相手に通知されません。',
    },
  },
  mcii: {
    common: {
      wishSuffix: 'ことで',
      outcomeSuffix: 'を得る！',
      obstacleSuffix: 'とき',
      behaviorSuffix: '。',
    },
    mciiEdit: {
      wish: '実現したいこと',
      wishDescription:
        'このアプリによる学習を通して、何を実現したいですか？やりがいがあり、実現できる目標を書いて下さい。',
      wishExample: '例: テストで良い点を取る',
      wishSuffix: 'こと',
      outcome: '得られるもの',
      outcomeDescription: '実現できたときに得られるもののうち、あなたにとって一番うれしいものは何ですか？',
      outcomeExample: '例: 勉強できるという自信',
      imagineOutcome: '得られるものを書き終えたら、それをできるだけハッキリとイメージしてください。',
      obstacle: '障害となるもの',
      obstacleDescription:
        '上記を実現する上で、障害として起こることは何ですか？感情的な問題や悪いクセなど、あなた自身の障害を書いて下さい。',
      obstacleExample: '例: 勉強中にマンガを読みたくなる',
      imagineObstacle: '障害となるものを書き終わったら、それをできるだけハッキリとイメージしてください。',
      behavior: '対策としてとる行動',
      behaviorDescription: '障害が起こったとき、その障害に打ち勝つためにはどうすれば良いですか？',
      behaviorExample: '例: マンガを本だなの上にかくす',
      addObstaclesAndBehaviors: '障害・対策を追加する',
    },
    mciiList: {
      startMcii: 'MCIIを始める',
      editMcii: 'MCIIの編集',
      obstacle: '障害',
      behavior: '対策',
      mciiDescription:
        '本機能では、Mental Contrasting with Implementation Intentions (MCII) と呼ばれる、科学的に効果が検証された、学習を続けるための手法を用います。',
      deletionAlertTitle: '削除の確認',
      deletionAlertBody: '削除してもよろしいですか？',
      sendAlertTitle: 'MCIIデータの送信確認',
      sendAlertBody:
        'MCIIのデータの保存方法を変更しました。これまではデータは端末のみに保存されていましたが、今後はサーバーにもデータが送信されるようになります。なお、当データは本アプリを改善する目的で利用されます。\n\n現在端末上に保存されているデータをサーバーに送信するか、端末上のデータをサーバーに送信せずに削除するか選択してください。',
      sendMciiData: 'サーバーにMCIIデータを送信する',
      deleteMciiData: '端末上のMCIIデータを削除する',
      tryMcii: 'ここをタップして、MCIIで学習が続くように工夫しよう！',
    },
  },
  quiz: {
    common: {
      percentage: 'みんなの正解率: ${quizPercentage}%',
    },
    answerButtons: {
      surrenderLarge: '分からない',
      surrenderSmall: '降参',
    },
    connectionError: {
      errorMessage: '現在サーバーに接続できません。しばらく時間をおいて試してください。',
    },
    itQuiz: {
      title: '基本情報技術者 平成${year}年${season}期 午前問${num}',
      quizNo: '問${num}',
      goToCommentary: '解説（Web）',
    },
    itQuizList: {
      shortTitle: '${year}年${season}期',
      title: '基本情報技術者 平成${year}年${season}期',
      questionNumber: '問${num}',
      answerDescription: '答えは「${answer}」です',
      checkAnswer: '答えを見る',
    },
    quizFinished: {
      goTop: 'トップに戻る',
      studyMore: '学習を続ける',
      question: '問題',
      answer: '解答',
      spentTime: '解答時間',
      notAnswered: '（未解答）',
      loadingMiniCompo: 'データを取得中です',
      resultMessageEffort: '解答完了。${praise}',
      resultMessagePerformance: '${nCorrect}問正解。${praise}',
    },
    quizOpening: { startRightNow: 'すぐに始める' },
    quizMenu: {
      title: '問題の変更',
      showDetail: '習得状況',
      selected: '選択中',
      selectQuiz: '選択する',
      memorizedQuizList: {
        title: '覚えた問題',
        noQuizzes: '問題がありません。',
        memorized: '覚えた問題',
        wrong: '前回不正解',
        correct: '前回正解',
        quizHeader: '問題',
        quizTitle: '全部で${num}問の問題があります',
      },
    },
    quizRunner: {
      questionNumber: '第${num}問. ',
      hijack: '${label}\nからの復習',
    },
    lecQuizRunner: {
      correct: '正しい',
      wrong: '間違い',
      commentary: '解説',
      showCommentary: '解説を読む',
      answerTextPrefix: '上記の文章は',
    },
    util: {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬',
      itQuizName: '平成${year}年${season}期 午前問${num}',
    },
    noLeitner: {
      caution: 'ライトナーシステムは作動してません。ランダムに出題しますがよろしいですか？',
      start: '開始する',
    },
    mark: {
      tapToNextProblem: 'タップで次の問題へ',
    },
  },
  startup: {
    registration: {
      confirmEmail: {
        confirmation: '以下の内容でユーザー登録してよろしいですか？',
        registrationFailure: 'ユーザー登録に失敗しました。再度お試しください。',
      },
      confirmName: {
        confirmation: '以下の内容でよろしいですか？',
        sendingFailure: '送信に失敗しました。再度お試しください。',
      },
      inputEmail: {
        experimentDescription:
          '所属している学校のメールアドレスを入力してください。本画面でメールアドレスを入力した場合、あなたが所属する学校に、本アプリを通して収集した情報を提供することがあります。',
        wrongEmail: '入力に誤りがあります',
        enterAppropriateEmail: '@をふくむメールアドレスを正しく入力してください。',
        enterSchoolEmail:
          'このメールアドレスでは登録できません。所属している学校のメールアドレスを正しく入力してください。',
        useOtherApp: 'このメールアドレスでは登録できません。別のアプリをご利用ください。',
      },
      inputName: {
        nameCaution: '本名は入れないでください！',
      },
      inputPreparedAccount: {
        loginFailure: 'ログインできませんでした。',
        wrongId: 'ログインIDが正しくありません。',
        wrongPassword: 'パスワードが正しくありません。',
        wrongCourse: '別のアプリをご利用ください。',
      },
      menu: {
        signupOrLoginWithEmail: 'アカウント作成\nもしくはログインして開始',
        loginWithIdAndPassword: '事前に提供された情報でログイン',
        signupWithoutEmail: 'アカウントを作成せずに開始',
      },
      terms: {
        agree: '利用規約とプライバシーポリシーに同意する',
        alertTitle: '規約等の追加について',
        alertBody:
          '本アプリの利用規約とプライバシーポリシーを追加しました。確認の上、同意する場合は、画面下部の同意ボタンを押して下さい。',
      },
      validateEmail: {
        passcodeDescription: '${email} 宛に送信されたパスコードを入力してください。',
        passcodeLossDescription:
          'パスコードが分からない場合、前のページにもどって再度「登録」ボタンを押すことで、新しいパスコードが発行されます。',
        certificationFailure: '認証に失敗しました。パスコードが正しいことをご確認ください。',
      },
      courses: {
        english: '英単語',
        itpassport: 'ITパスポート',
        informatics: '基本情報試験対策',
      },
    },
  },
  studyHistory: {
    progressMessage: {
      progressPrefix: '${date}からの進展は、',
      comma: '、',
      progressSuffix: 'です。',
    },
    studyHistoryChart: {
      chartDescription: '学習を行うか目標を設定すると、ここにグラフが表示されるようになります。',
    },
    studyHistory: {
      allTime: '全期間の${label}',
      allTimeShort: '全期間',
      allUsers: '全ユーザー${numOfUsers}人中',
      allUsersShort: '${numOfUsers}人中',
      numberCorrectPerWeek: '各週の正答数',
      rankingPerWeek: '各週の順位',
      tapToInput: 'タップして入力',
    },
    studyHistoryTable: {
      notYetAchieved: 'あなたの目標まであと${diff}問です。',
      alreadyAchieved: 'おめでとうございます！目標を達成しました！',
    },
  },
  survey: {
    common: {
      surveyDescription:
        'これから、あなたの意欲に関する心理的な傾向を測る質問と、年齢・性別の確認を行います。いただいた回答は、本アプリで提供されている行動促進手法の推薦、および推薦の仕組みの改善に用いられます。',
      agreementDescription: '上記に同意する場合は、回答を始めて下さい。',
      startSurvey: '回答をはじめる',
      thankYou: 'ご協力\nありがとうございました',
    },
    postSurvey: {
      surveyDescription:
        '実験にご参加いただき、ありがとうございました。\n事後アンケートにご協力ください。\nアンケート回答後、アプリを継続してご利用いただくことも可能です。',
      postTest: 'アンケート回答後、任意で英単語のテストを受けることが出来ます。',
      surveySendingFailure: 'アンケートを送信できませんでした。',
      accessLater: '現在サーバーに接続できません。\nしばらく時間をおいて再送信してください。',
      sendingSurvey: 'アンケートを送信中です',
      backToApp: 'アプリに戻る',
      resend: 'アンケートを送信する',
    },
    preSurvey: {
      startApplication: '次へ',
      surveySendingFailure:
        'アンケートの送信に失敗しました。オンラインであることを確認したうえ、再度「アプリケーションの利用を始める」を押してください。',
      pleaseWait: 'データを通信しています。しばらくお待ちください。',
    },
    surveyQuestion: { notApplicable: '特になし', AnswerRandomlyForTests: '全て適当に答える（テスト用）' },
  },
  pretest: {
    firstPage: {
      message: 'スマートモチベーターへようこそ！\nこのアプリでは、クイズを解きながら英単語を学習できます。',
      next: '次へ',
    },
    secondPage: {
      message:
        '実験期間終了後に、自分の学習成果を確かめるために、アプリ内で実力テストを受けることができます。\n\n正確に学習成果を測るため、学習を始める前にもテストを受けることをおすすめします。\n\n今から、本番と同じ形式の練習テストを受けますか？',
      yes: '受ける',
      skip: '受けない',
      random: '適当に答える（テスト用）',
    },
    firstPost2: {
      message: 'お疲れ様でした。\n\nこれまでの学習成果を確かめるために、実力テストを受けますか？',
    },
    resultPage1: {
      message1: 'お疲れ様でした。練習テストの結果です。',
      message2:
        'これから、スマモチでたくさんの英単語を覚えて、実験期間終了に学習した成果を確認しましょう。応援しています！',
      startApp: 'アプリの利用を開始する',
    },
    resultPage2: {
      message1: 'お疲れ様でした。テストの結果です。',
      startApp: 'アプリの利用に戻る',
    },
  },
  calendar: {
    dateChange: '${year}年 ${month}月',
    notes: {
      quizzes: 'この日の解答数は${total}問、\nそのうち${correct}問正解しました。',
      quizzesTitle: '学習履歴',
      points: 'この日に獲得したポイントは${pointsDay}点、\nこの日までの合計は${pointsTotal}点です。',
      pointsTitle: 'ポイント',
    },
  },
  mission: {
    common: {
      answerTitle: '${num}問に解答しよう',
      correctTitle: '${num}問に正解しよう',
      fastCorrectTitleShort: '${threshold}秒で正解（${num}問）',
      fastCorrectTitleLong: '${num}問に${threshold}秒以内で正解しよう',
      memorizedTitle: '${num}問を覚えよう',
      progress: 'あと${value}問',
      praise: 'ミッション達成おめでとう！',
    },
    mission: {
      pointUnit: 'ポイント',
      level: 'レベル${level}',
      bonus: '（ボーナス: 💎${bonus}倍）',
      listLegend: '目標一覧（毎日リセット）',
      seeRankingMore: 'もっと見る',
      seeHistory: '目標の達成履歴を見る',
      levelUpModal: {
        title: 'レベルアップしました！',
        level: 'レベル${level}',
        point: '条件: ${point} 以上',
        bonus: '💎ボーナス: ${beforeBonus}倍 → ${afterBonus}倍',
      },
      rankUpModal: {
        title: 'ランクアップ',
      },
      calendarModal: {
        description: '今日も目標を達成しました。この調子で頑張りましょう！',
      },
    },
    calendar: {
      yearMonth: 'YYYY年 MM月',
    },
    missionHistory: {
      missionCount: '達成した目標数',
      totalPoint: '合計獲得ポイント',
      achievedTime: '達成時刻',
      missionName: '目標',
      point: '獲得ポイント',
      noRecord: '履歴はありません',
    },
    missionRanking: {
      positiveFramingMessage: 'あと${approxPoint}で${rank}位に勝てる💪',
      negativeFramingMessage: 'あと${approxPoint}ないと${rank}位に負ける😰',
      firstRankMessage: '1位になりました🎉',
    },
    myRanking: {
      title: '自己ベスト（1時間ごと）',
      positiveFramingMessage: 'あと${approxPoint}で${rank}位を超えられる💪',
      negativeFramingMessage: 'あと${approxPoint}ないと${rank}位に負ける😰',
      firstRankMessage: '自己ベストを更新しました🎉',
    },
    level: {
      positiveFramingMessage: 'あと${approxPoint}でレベルUPできる💪',
      negativeFramingMessage: '後${approxPoint}ないとレベルUPできない😰',
    },
  },
  newTop: {
    newTop: {
      memorizedCount: '覚えた問題数',
      answeredCount: '解いた問題数',
      startQuiz: '問題を解く',
      changeQuiz: '問題変更',
      welcome: 'ようこそ${name}さん',
      checkAttendance: '出席チェック',
      genreInfo: '覚えた数: ${memorized}問  正解数: ${correct}問  [全${all}問]',
    },
    firstConfig: {
      pleaseSetupDefault:
        'アンケートの回答結果から、やる気を出す仕組みのオススメ設定を以下のように決定しました。以下から変更することもできます。',
      pleaseSetupManual: 'このアプリで使われる、やる気を出す仕組みの設定をしてください。',
      pleaseSetupExisting:
        'やる気を出す仕組みがアップデートされました。設定をしてください。あなたにオススメの設定は以下のとおりです。',
      start: 'この設定でアプリを利用する',
    },
  },
  appRoot: {
    updateDialog: {
      title: 'アプリのアップデート',
      updateMessage: 'アプリをアップデートします。アップデート完了後、アプリが再起動します。',
      descriptionPrefix: '\n\n======== 更新内容 ========\n',
    },
    updatingAppError:
      'アップデートの確認中にエラーが発生しました。ネットワークに正しく接続されているか確認して下さい。再試行します。',
    gettingDataError:
      'サーバーに接続できませんでした。ネットワークに正しく接続されているか確認して下さい。再試行します。',
  },
  about: {
    terms: '利用規約とプライバシーポリシー',
    promotionDescription:
      'アプリ内で提供される行動促進機能はユーザーごとに異なっています。これらの行動促進機能は、アプリ使用中に別の機能に変わることがありますが、正常な動作ですので、そのままお使いください。',
    defaultContact: '',
    aboutInquiry: 'お問い合わせ方法について',
    aboutEnglishWords: '英単語の問題について',
    aboutWordList:
      '英単語の問題は、以下の単語リスト（NGSL 1.01）から簡単な単語を取り除いて作成しました。NGSLは一般的な英文の92%をカバーできるように作られており、学術的に高い評価を受けています。',
  },
  achievementHelper: {
    effortPraises: [
      '頑張っていますね😃',
      'よく頑張りました✨',
      '努力していますね👍',
      'よく勉強していますね😊',
      'その調子で頑張ろう💪',
    ],
    performancePraises: [
      '高得点ですね😃',
      '良い成績ですね✨',
      'よく覚えていますね👍',
      '上手に学んでいますね😊',
      '高得点を取り続けよう💪',
    ],
  },
  titleHelper: {
    title: 'レベル${level}',
  },
  storageViewer: {
    dataResetAlert: 'データをリセットしてもよろしいですか',
    keyDeletionAlert: '${key} を削除してもよろしいですか',
  },
  top: {
    topTitle: '機能のリスト',
    studyTitle: '問題を解く',
    quizSetTitle: '過去問の確認',
    studyHistoryTitle: '週ごとの学習状況',
    studyHistoryDescription: '毎週の結果をふりかえって、目標を立てよう。',
    postQuestionnaireTitle: '事後アンケート',
    postQuestionnaireDescription: '実験へのご参加ありがとうございました。最後に事後アンケートにご回答ください。',
    battleTitle: '週間ランキング',
    battleDefaultDescription: 'クイズをたくさん解いてバトルに勝利しよう！',
    pointTitle: 'ポイントと階級',
    pointDefaultDescription: 'ポイントを貯めて階級を手に入れよう！',
    pointHistoryTitle: 'ポイント入手記録',
    pointRankingTitle: '階級内ランキング',
    pointRankingDescription: '同じ階級の人とポイントで競争しよう！',
    followTitle: 'フォロー',
    followDescription: '他のユーザーをフォローして、状況を確認しよう。',
    MCIITitle: 'MCII',
    MCIIDefaultDescription: '科学的な手法で、学習を続けよう。',
    calendarTitle: '日々の学習状況',
    calendarDescription: '毎日の結果をふりかえろう。',
    reminderTitle: 'リマインダー',
    configTitle: '設定',
    aboutTitle: 'このアプリについて',
    storageTitle: 'ストレージ',
    storageDescription: 'デバッグ用！\n保存内容を確認',
    message: {
      star: 'トップに追加しました',
      unstar: 'トップから消しました',
    },
    starDescription: '好きな機能に★を付けると、トップ画面にショートカットのアイコンが表示されます。',
    surveyAlertTitle: '事後アンケートのお願い',
    surveyAlertBody:
      '実験へのご参加ありがとうございました。最後に、事後アンケートにご回答下さい。\n\nなお、今すぐにご回答いただけない場合も、トップ画面の右下にある[...]ボタンを押して表示されるメニューから「事後アンケート」選択することで、いつでもご回答いただけます。',
    surveyAlertBodyForMinimal:
      '実験へのご参加ありがとうございました。最後に、事後アンケートにご回答下さい。\n\nなお、今すぐにご回答いただけない場合も、トップ画面の「事後アンケート」から、いつでもご回答いただけます。',
    gotoPostSurvey: '今から回答する',
    dontGotoPostSurvey: '後で回答する',
    calendarModalTitle: '今日も目標達成しよう',
    calendarModalDescription: '（達成した日に色が付きます）',
    missionRanking: 'ランキング',
    missionHistory: '目標の達成履歴',
  },
  progress: {
    remainingDays: '残り${diffDays}日と${diffHours}時間 (${startMonth}/${startDay} - ${endMonth}/${endDay})',
    remainingQuizzes: 'あと${number}問で成功 (${correctCount} / ${goalCorrectCount}問)',
    succeeded: '成功！ (${correctCount} / ${goalCorrectCount}問)',
  },
};
function createSkeletonDictionary(dict) {
  return _.mapValues(dict, (value, key) => {
    return _.isString(value) ? key : createSkeletonDictionary(value);
  });
}
export const SKELETON_DICTIONARY: typeof JA_DICTIONARY = createSkeletonDictionary(JA_DICTIONARY);
