import { useEffect, useRef, useState } from 'react';

export default function AnimatedText({
  text,
  tag: Tag = 'span',
  className = '',
  delay = 0,
  speed = 30,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [isVisible, text, delay, speed]);

  return (
    <Tag ref={ref} className={className}>
      {displayedText}
      {isVisible && displayedText.length < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-rose-500 ml-0.5 animate-pulse-soft" />
      )}
    </Tag>
  );
}
