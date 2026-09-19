interface UserAvatarProps {
  nickname: string
  className?: string
}

function UserAvatar({ nickname, className = '' }: UserAvatarProps) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-title-medium font-semibold text-white ${className}`}
    >
      {nickname.slice(0, 1)}
    </span>
  )
}

export default UserAvatar
