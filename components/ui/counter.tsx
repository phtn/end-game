import { ClassName } from '@/types'
import { MotionValue, motion, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

interface NumberProps {
  mv: MotionValue<number>
  number: number
  height: number
}

function Number({ mv, number, height }: NumberProps) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * height
    if (offset > 5) {
      memo -= 10 * height
    }
    return memo
  })

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <motion.span style={{ ...style, y }} className='tracking-tighter'>
      {number}
    </motion.span>
  )
}

interface DigitProps {
  place: number
  value: number
  height: number
  digitStyle?: React.CSSProperties
}

function Digit({ place, value, height, digitStyle }: DigitProps) {
  const valueRoundedToPlace = Math.floor(value / place)
  const animatedValue = useSpring(valueRoundedToPlace)

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace)
  }, [animatedValue, valueRoundedToPlace])

  const defaultStyle: React.CSSProperties = {
    height,
    position: 'relative',
    width: '1ch'
    // fontVariantNumeric: 'tabular-nums'
  }

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  )
}

interface CounterProps {
  value: number
  fontSize?: number
  padding?: number
  places?: number[]
  gap?: number
  borderRadius?: number
  horizontalPadding?: number
  textColor?: string
  fontWeight?: React.CSSProperties['fontWeight']
  containerStyle?: React.CSSProperties
  counterStyle?: React.CSSProperties
  digitStyle?: React.CSSProperties
  gradientHeight?: number
  gradientFrom?: string
  gradientTo?: string
  topGradientStyle?: React.CSSProperties
  bottomGradientStyle?: React.CSSProperties
  className?: ClassName
}

export function Counter({
  value,
  fontSize = 28,
  padding = 0,
  places = [10, 1],
  gap = 0,
  borderRadius = 0,
  horizontalPadding = 0,
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  className
}: CounterProps) {
  const height = fontSize + padding

  const defaultContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  }

  const defaultCounterStyle: React.CSSProperties = {
    fontSize,
    display: 'flex',
    gap,
    overflow: 'hidden',
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    // color: textColor,
    fontWeight
  }

  return (
    <div className='' style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultCounterStyle, ...counterStyle }} className={className}>
        {places.map((place) => (
          <Digit key={place} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
      </div>
    </div>
  )
}
