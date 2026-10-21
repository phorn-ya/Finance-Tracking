import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { authPersistenceReady, firebaseAuth, firestore } from '../firebase'

export interface UserInfo {
  id: string
  name: string
  email: string
}

function authErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/requires-recent-login': 'Please sign in again before making this change.',
    'auth/wrong-password': 'The current password is incorrect.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email. Sign in using its original method.',
    'auth/unauthorized-domain': 'This domain is not authorized for Firebase sign-in.',
  }
  return (code && messages[code]) || fallback
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const authUser = ref<User | null>(firebaseAuth.currentUser)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let resolveReady!: () => void
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve
  })
  let initialized = false
  const redirectResult = authPersistenceReady
    .then(() => getRedirectResult(firebaseAuth))
    .then(async (result) => {
      if (!result) return
      const profileRef = doc(firestore, 'users', result.user.uid)
      await setDoc(
        profileRef,
        {
          name: result.user.displayName || '',
          email: result.user.email || '',
        },
        { merge: true },
      )
    })
    .catch((err: unknown) => {
      error.value = authErrorMessage(err, 'Google sign-in failed. Please try again.')
      console.error('Failed to complete Google sign-in redirect:', err)
    })

  const isAuthenticated = computed(() => authUser.value !== null)
  onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    authUser.value = firebaseUser
    user.value = firebaseUser
      ? {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        }
      : null
    await redirectResult
    if (!initialized) {
      initialized = true
      resolveReady()
    }
  })

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await authPersistenceReady
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      return true
    } catch (err) {
      error.value = authErrorMessage(err, 'Login failed. Verify your credentials.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await authPersistenceReady
      await signInWithRedirect(firebaseAuth, new GoogleAuthProvider())
      return true
    } catch (err) {
      error.value = authErrorMessage(err, 'Google sign-in failed. Please try again.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await authPersistenceReady
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      await updateFirebaseProfile(credential.user, { displayName: name })
      await setDoc(doc(firestore, 'users', credential.user.uid), {
        name,
        email,
        created_at: serverTimestamp(),
      })
      await sendEmailVerification(credential.user)
      user.value = {
        id: credential.user.uid,
        name,
        email,
      }
      return true
    } catch (err) {
      error.value = authErrorMessage(err, 'Registration failed.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    await signOut(firebaseAuth)
    user.value = null
  }

  async function fetchCurrentUser(): Promise<void> {
    await ready
  }

  async function updateProfile(name: string, email: string): Promise<boolean> {
    const currentUser = firebaseAuth.currentUser
    if (!currentUser) {
      error.value = 'You must be signed in to update your profile.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      await updateFirebaseProfile(currentUser, { displayName: name })
      if (email !== currentUser.email) await updateEmail(currentUser, email)
      await updateDoc(doc(firestore, 'users', currentUser.uid), { name, email })
      user.value = { id: currentUser.uid, name, email }
      return true
    } catch (err) {
      error.value = authErrorMessage(err, 'Profile update failed.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const currentUser = firebaseAuth.currentUser
    if (!currentUser?.email) {
      error.value = 'You must be signed in to change your password.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
      return true
    } catch (err) {
      error.value = authErrorMessage(err, 'Failed to change password.')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    ready,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
  }
})
