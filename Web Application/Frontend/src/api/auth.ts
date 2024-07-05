import { AxiosInstance, isAxiosError } from "axios";
import { AuthData, ProfileData, UserEmail } from "../interface/auth";
import { ApiError } from "../interface/api";

export async function login(
  axios: AxiosInstance,
  email: string, 
  password: string
): Promise<AuthData> {
  try {
    const res = await axios.post("/auth/login", {
      email,
      password,
    });

    return res.data as AuthData;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function register(
  axios: AxiosInstance,
  name: string,
  phone: string,
  email: string, 
  password: string,
  role: string,
): Promise<void> {
  try {
   await axios.post("/auth/register", {
      name,
      phone,
      email,
      password,
      role,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function emailCheck(
  axios: AxiosInstance,
  email: string
): Promise<void> {
  try {
    await axios.get(`/auth/check/${email}`);
   } catch (e) {
     if (isAxiosError(e)) {
       throw new ApiError(e.response?.data.message ? 
         e.response?.data.message : "Something Went Wrong");
     }
 
     throw new ApiError("Something Went Wrong");
   }
}

export async function profile(
  axios: AxiosInstance,
): Promise<ProfileData> {
  try {
    const res = await axios.get("/auth/me");

    return res.data as ProfileData;
   } catch (e) {
     if (isAxiosError(e)) {
       throw new ApiError(e.response?.data.message ? 
         e.response?.data.message : "Something Went Wrong");
     }
 
     throw new ApiError("Something Went Wrong");
   }
}

export async function updateProfile(
  axios: AxiosInstance,
  name: string,
  phone: string
): Promise<void> {
  try {
    await axios.put("/auth/me", {
      name, 
      phone
    });
   } catch (e) {
     if (isAxiosError(e)) {
       throw new ApiError(e.response?.data.message ? 
         e.response?.data.message : "Something Went Wrong");
     }
 
     throw new ApiError("Something Went Wrong");
   }
}

export async function updatePassword(
  axios: AxiosInstance,
  current_password: string,
  new_password: string
): Promise<void> {
  try {
    await axios.put("/auth/me/password", {
      current_password, 
      new_password
    });
   } catch (e) {
     if (isAxiosError(e)) {
       throw new ApiError(e.response?.data.message ? 
         e.response?.data.message : "Something Went Wrong");
     }
 
     throw new ApiError("Something Went Wrong");
   }
}

export async function verifyEmail(
  axios: AxiosInstance,
  token: string,
  userID: string
): Promise<void> {
  try {
    await axios.get(`/auth/verify-email`, {
      params: {
        token: token,
        userID: userID
      }
    });
  } catch (e) {
     if (isAxiosError(e)) {
       throw new ApiError(e.response?.data.message ? 
         e.response?.data.message : "Something Went Wrong");
     }
 
     throw new ApiError("Something Went Wrong");
   }
}

export async function getAllEmails(
  axios: AxiosInstance
): Promise<Array<UserEmail>> {
  try {
    const res = await axios.get("/auth/all-emails");

    return res.data.data as Array<UserEmail>;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}