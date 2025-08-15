import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

// 쉐이더 애니메이션
const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const cardGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3),
                0 0 40px rgba(255, 255, 255, 0.2),
                0 0 60px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
                0 0 60px rgba(255, 255, 255, 0.3),
                0 0 90px rgba(255, 255, 255, 0.2);
  }
`;

const rainbowShimmer = keyframes`
  0% { 
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% { 
    background-position: 100% 50%;
    filter: hue-rotate(180deg);
  }
  100% { 
    background-position: 0% 50%;
    filter: hue-rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const particleFloat = keyframes`
  0% { 
    transform: translateY(0px) translateX(0px) scale(0);
    opacity: 0;
  }
  50% { 
    opacity: 1;
  }
  100% { 
    transform: translateY(-100px) translateX(50px) scale(1);
    opacity: 0;
  }
`;

const CardContainer = styled(motion.div)`
  position: relative;
  cursor: ${props => props.$isHand ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  
  ${props => props.$isHand && css`
    &:hover {
      transform: translateY(-15px) scale(1.05);
      z-index: 10;
    }
  `}
`;

const Card = styled.div`
  width: ${props => props.$isHand ? '100px' : '70px'};
  height: ${props => props.$isHand ? '150px' : '105px'};
  background: ${props => {
    if (props.$isHint) {
      return 'linear-gradient(145deg, #ffd93d, #ffb347)';
    } else if (props.$isPlayed) {
      return 'linear-gradient(145deg, #6bcf7f, #8dd99c)';
    } else if (props.$isOtherPlayer && !props.$isRevealed) {
      return 'linear-gradient(145deg, #2c3e50, #34495e)';
    } else if (props.$isRevealed) {
      return 'linear-gradient(145deg, #e74c3c, #c0392b)';
    } else {
      return 'linear-gradient(145deg, #ffffff, #f0f0f0)';
    }
  }};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$isHand ? '2rem' : '1.5rem'};
  font-weight: 900;
  color: ${props => {
    if (props.$isHint) {
      return '#333';
    } else if (props.$isOtherPlayer && !props.$isRevealed) {
      return '#ecf0f1';
    } else if (props.$isRevealed) {
      return '#fff';
    } else {
      return '#333';
    }
  }};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 3px solid transparent;
  
  ${props => props.$isHand && css`
    animation: ${float} 3s ease-in-out infinite;
    animation-delay: ${props.$index * 0.1}s;
  `}
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => {
      if (props.$isHint) {
        return 'linear-gradient(45deg, #ffd93d, #ffb347, #ff8e8e, #ffd93d)';
      } else if (props.$isPlayed) {
        return 'linear-gradient(45deg, #6bcf7f, #8dd99c, #4d9de0, #6bcf7f)';
      } else if (props.$isOtherPlayer && !props.$isRevealed) {
        return 'linear-gradient(45deg, #2c3e50, #34495e, #7f8c8d, #2c3e50)';
      } else if (props.$isRevealed) {
        return 'linear-gradient(45deg, #e74c3c, #c0392b, #8e44ad, #e74c3c)';
      } else {
        return 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d9de0, #a855f7, #ff6b6b)';
      }
    }};
    background-size: 400% 400%;
    border-radius: 12px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${props => props.$isHand && css`
    &::before {
      opacity: 0.8;
      animation: ${rainbowShimmer} 4s ease-in-out infinite;
    }
  `}
  
  ${props => props.$isHint && css`
    &::before {
      opacity: 0.6;
      animation: ${shimmer} 3s ease-in-out infinite;
    }
  `}
  
  ${props => props.$isPlayed && css`
    &::before {
      opacity: 0.4;
      animation: ${shimmer} 2s ease-in-out infinite;
    }
  `}
  
  ${props => props.$isOtherPlayer && !props.$isRevealed && css`
    &::before {
      opacity: 0.3;
      animation: ${shimmer} 4s ease-in-out infinite;
    }
  `}
  
  ${props => props.$isRevealed && css`
    &::before {
      opacity: 0.7;
      animation: ${shimmer} 2s ease-in-out infinite;
    }
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => {
      if (props.$isHint) {
        return 'linear-gradient(45deg, #ffd93d, #ffb347, #ff8e8e, #ffd93d)';
      } else if (props.$isPlayed) {
        return 'linear-gradient(45deg, #6bcf7f, #8dd99c, #4d9de0, #6bcf7f)';
      } else if (props.$isOtherPlayer && !props.$isRevealed) {
        return 'linear-gradient(45deg, #2c3e50, #34495e, #7f8c8d, #2c3e50)';
      } else if (props.$isRevealed) {
        return 'linear-gradient(45deg, #e74c3c, #c0392b, #8e44ad, #e74c3c)';
      } else {
        return 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d9de0, #a855f7, #ff6b6b)';
      }
    }};
    background-size: 400% 400%;
    border-radius: 14px;
    z-index: -2;
    opacity: 0;
    animation: ${shimmer} 3s ease-in-out infinite;
  }
  
  ${props => props.$isHand && css`
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CardNumber = styled.div`
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
`;

const PlayerName = styled.div`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  
  ${props => props.$isHand && css`
    opacity: 0.3;
    animation: ${cardGlow} 2s ease-in-out infinite;
  `}
`;

const ParticleEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${props => props.$color || '#ffffff'};
  border-radius: 50%;
  opacity: 0.8;
  
  &:nth-child(1) { 
    animation: ${particleFloat} 3s linear infinite;
    animation-delay: 0s; 
  }
  &:nth-child(2) { 
    animation: ${particleFloat} 3s linear infinite;
    animation-delay: 0.5s; 
  }
  &:nth-child(3) { 
    animation: ${particleFloat} 3s linear infinite;
    animation-delay: 1s; 
  }
  &:nth-child(4) { 
    animation: ${particleFloat} 3s linear infinite;
    animation-delay: 1.5s; 
  }
  &:nth-child(5) { 
    animation: ${particleFloat} 3s linear infinite;
    animation-delay: 2s; 
  }
`;

const GameCard = ({ 
  card, 
  isHand = false, 
  isPlayed = false, 
  isHint = false, 
  isOtherPlayer = false,
  isRevealed = false,
  onClick, 
  playerName,
  index = 0,
  ...props
}) => {
  const handleClick = () => {
    if (isHand && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    // 호버 효과는 CSS로 처리됨
  };

  const handleMouseLeave = () => {
    // 호버 효과는 CSS로 처리됨
  };

  return (
    <CardContainer
      $isHand={isHand}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={isHand ? { scale: 1.05 } : {}}
      whileTap={isHand ? { scale: 0.95 } : {}}
      {...props}
    >
      <Card
        $isHand={isHand}
        $isPlayed={isPlayed}
        $isHint={isHint}
        $isOtherPlayer={isOtherPlayer}
        $isRevealed={isRevealed}
        $index={index}
      >
        <CardContent>
          <CardNumber>
            {isOtherPlayer && !isRevealed ? '?' : card}
          </CardNumber>
        </CardContent>
        
        {isHand && (
          <ParticleEffect>
            {[...Array(5)].map((_, i) => (
              <Particle
                key={i}
                $color={['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d9de0', '#a855f7'][i]}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${80 + i * 10}%`
                }}
              />
            ))}
          </ParticleEffect>
        )}
      </Card>
      
      <GlowEffect $isHand={isHand} />
      
      {playerName && (
        <PlayerName>{playerName}</PlayerName>
      )}
    </CardContainer>
  );
};

export default GameCard; 