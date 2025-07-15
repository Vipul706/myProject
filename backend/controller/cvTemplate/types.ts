type cvErrorCode = 'NO_ERROR' | 'USER_DATA_DOES_NOT_EXIST' | 'INVALID_ACCESS'
 interface CvData {
  _id?: string; // Optional if not fetched from DB yet
  user: string;
  exp: {
    name: string;
    duration: string;
    position: string;
    pointers: string[];
  }[];
  skills: string[];
  education: {
    duration: string;
    name: string;
    program: string;
    cgpa: string;
  }[];
  languages: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type {
    cvErrorCode,
    CvData
}