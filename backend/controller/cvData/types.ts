interface AddCvDataRequest {
    name: string;
    experiences: {
        companyName: string;
        startYear: string;
        endYear: string;
        position: string;
        pointerType: 'paragraph' | 'bullets';
        pointers: string[];
    }[];
    skills: string[];
    languages: string[];
    email:string;
}

interface helperType {
    errorCode: "NO_ERROR" | "USER_DOES_NOT_EXIST",
    statusCode: number,
}


export type {
    AddCvDataRequest,
    helperType
}