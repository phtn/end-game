import { Team } from '@/lib/store'
import { CldImage } from 'next-cloudinary'
export const PrimaryTeam = ({ id, logo, name }: Team) => {
  return (
    <div id={id} className='flex-1 flex flex-col items-center justify-between gap-0 md:gap-3'>
      {logo && <CldImage width={300} height={300} src={logo} alt={name} className='size-20 md:size-32 object-cover' />}
      <div className='text-base text-foreground font-brk uppercase'>{id}</div>
      <div className='hidden md:flex text-sm text-muted-foreground tracking-tighter'>{name}</div>
    </div>
  )
}
