/* Auth types */
export interface ILoginData {
    email: string | null;
    password: string | null;
    remember: boolean;
}

export interface ISignUpData {
    email: string | null;
    firstname: string | null;
    lastname: string | null;
    password: string | null;
}

export interface IUserData {
    id: string | null
    email: string | null;
    firstname: string | null;
    lastname: string | null;
    role: string | null;
}

export interface IAuthContext {
    isLoggedIn: boolean | null;
    userData: IUserData | undefined;
    isAuthModalOpen: boolean,
    setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    handleLogin: (data: ILoginData) => Promise<boolean>;
    handleSignUp: (data: ISignUpData) => Promise<Response>;
    handleLogout: () => void;
}

/* Screening types */
export interface IScreeningItem {
    movie: {
        title: string;
        poster: string;
    };
    _id: string;
    slug: string;
    date: string | Date;
    time: string;
}

export interface IScreening {
    movie: {
        title: string,
        director: string[],
        casting: string[],
        genres: string[],
        synopsis: string,
        poster: string,
        backdrop: string,
        trailer: string,
        score: string,
        length: string,
        release: Date
    },
    date: Date,
    formattedDate: string,
    slug: string,
    bookedSeats: string[]
}

/* Booking types */
export interface ITicket {
    rate: string;
    price: number;
}

export interface IBooking {
    screening_id: string;
    tickets: ITicket[];
    seats: string[];
    created_dt?: Date;
}

/* Form types */
export interface IInputField {
    value: string | null;
    error: string | false | null;
}

export interface ICheckbox {
    value: boolean;
    error: string | false | null;
}
