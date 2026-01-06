import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from './toaster'
import { useToast } from '@/hooks/use-toast'
import { Button } from './button'

const ToastDemo = () => {
  const { toast } = useToast()

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up ',
            description: 'Friday, February 10, 2023 at 5:57 PM',
          })
        }}
      >
        Show Toast
      </Button>

      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
          })
        }}
      >
        Show Error
      </Button>
    </div>
  )
}

const meta: Meta = {
  title: 'UI/Toast',
  component: Toaster,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <div>
      <ToastDemo />
      <Toaster />
    </div>
  ),
}
