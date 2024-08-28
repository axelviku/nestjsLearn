export enum CURRENCY {
  USD = 'USD',
  JPY = 'JPY',
  EUR = 'EUR',
  GBP = 'GBP',
  CNY = 'CNY',
  MXN = 'MXN',
}

export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum SOURCE {
  EMAIL = 'email',
  SOCIAL = 'social',
}

export enum SIGNUP_TYPE {
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum DEVICE_TYPE {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

export enum OTP_TYPE {
  VERIFY_EMAIL = 'VERIFYEMAIL',
  VERIFY_PHONE = 'VERIFYPHONE',
  FORGOT_PASSWORD = 'FORGOTPASSWORD',
  SIGN_UP = 'SIGNUP',
}

export enum FileType {
  IMAGE = 'IMAGE',
}

export enum MESSAGE_TYPE {
  TEXT = 'text',
  FILE = 'file',
}

export enum NOTIFICATION_TYPE {}

export enum MEDIA_TYPE {
  USER = 'users',
  PROF_DOCS = 'prof_docs',
  CHAT_IMAGE = 'chat_images',
  CHAT_DOCS = 'chat_docs',
}

export enum HOME_GETUSER_LIST {
  CLIENT = 'client',
  INTERPRETER = 'interpreter',
  REFERRAL_USER = 'referral_user',
}

export enum INTERPRETER_FILTER {
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DSC = 'PRICE_DSC',
  INTERPRETER_SCORE = 'INTERPRETER_SCORE',
}

export enum ANALYSIS_SCREEN_TYPE {
  FETCH_DAC_DATA = 'FETCH_DAC_DATA',
  POST_DCA_DATA = 'POST_DCA_DATA',
}

export enum SOCIAL_TYPE {
  gmail = 'google',
  facebook = 'facebook',
  apple = 'apple',
  twitter = 'twitter',
}

export enum DEVICE_PERMISSION_TYPE {
  FETCH = 'fetch',
  POST = 'post',
}
export enum USER_ROLE {
  CLIENT = 'client',
  INTERPRETER = 'interpreter',
}

export enum CALL_TYPE{
  ONE_TO_ONE = 'onetoone',
  THREEWAY_CALL = '3way',
  GROUP_WITH_PSTN = 'groupWithPstn',
  GROUP_WITHOUT_PSTN = 'groupWithoutPstn'
}
