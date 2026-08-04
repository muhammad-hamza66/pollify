import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Settings as SettingsIcon, Lock, Trash2 } from "lucide-react";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import FormField from "../components/ui/FormField";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      const data = await authApi.updateProfile({
        name,
        username,
        bio,
        image: imageFile || undefined,
      });
      setUser(data.user);
      toast.success("Profile updated");
    } catch (e2) {
      setProfileError(e2.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e2) {
      setPasswordError(e2.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      toast.success("Account deleted");
      logout();
      navigate("/");
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#0f172a] dark:text-white">
          <SettingsIcon className="h-5 w-5 text-primary-600" /> Settings
        </h1>
        <p className="text-sm text-[#64748b] dark:text-gray-400 mt-0.5">
          Manage your profile, security, and account.
        </p>
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="font-semibold text-[#0f172a] dark:text-gray-100">
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={preview || user?.avatar}
              name={name}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onPickImage}
            />
          </div>
          <p className="text-xs text-[#94a3b8]">
            Click the camera icon to change your photo.
          </p>
        </div>

        <FormField label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Username">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormField>
        <FormField label="Bio" hint={`${bio.length}/160`}>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            rows={3}
          />
        </FormField>

        {profileError && (
          <p className="text-sm text-red-500">{profileError}</p>
        )}
        <Button type="submit" loading={savingProfile}>
          Save changes
        </Button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2 text-[#0f172a] dark:text-gray-100">
          <Lock className="h-4 w-4 text-[#94a3b8]" /> Change password
        </h2>
        <FormField label="Current password">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </FormField>
        <FormField label="New password" hint="At least 8 characters">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
        </FormField>
        {passwordError && (
          <p className="text-sm text-red-500">{passwordError}</p>
        )}
        <Button type="submit" variant="outline" loading={savingPassword}>
          Update password
        </Button>
      </form>

      {/* Danger zone */}
      <div className="card p-6 border-red-200 dark:border-red-900/40">
        <h2 className="font-semibold text-red-600 flex items-center gap-2 mb-1">
          <Trash2 className="h-4 w-4" /> Danger zone
        </h2>
        <p className="text-sm text-[#64748b] dark:text-gray-400 mb-4 leading-relaxed">
          Deleting your account removes all your polls, comments, and votes.
          This can't be undone.
        </p>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete my account
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
        loading={deleting}
        title="Delete your account?"
        description="This is permanent. All your polls, comments, and votes will be removed."
        confirmLabel="Delete account"
      />
    </div>
  );
}
