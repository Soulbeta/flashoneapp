import React, { useState, useRef, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card, H1, H2, Input } from '@tamagui/core';
import { Play, Pause, RotateCcw, CheckCircle, ArrowRight } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  FadeInDown 
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const tutorialSteps = [
  {
    id: 'explanation',
    title: 'Understanding Flash Anzan',
    content: 'Flash Anzan trains you to calculate quickly by showing numbers one at a time. You\'ll visualize an abacus in your mind and move the beads mentally as each number appears.',
    showDemo: false
  },
  {
    id: 'demonstration',
    title: 'Watch & Learn',
    content: 'Let\'s see Flash Anzan in action! Watch these numbers appear, then try to calculate the sum in your head.',
    showDemo: true,
    demoNumbers: [15, 23, 18, 12],
    demoSpeed: 2000,
    correctAnswer: 68
  },
  {
    id: 'practice',
    title: 'Your Turn!',
    content: 'Now try it yourself. Watch these numbers and calculate the sum mentally.',
    showDemo: true,
    demoNumbers: [7, 13, 9, 5],
    demoSpeed: 2500,
    correctAnswer: 34,
    interactive: true
  },
  {
    id: 'tips',
    title: 'Success Tips',
    content: 'Start slow and gradually increase speed. Visualize the abacus clearly. Practice daily for best results!',
    showDemo: false
  }
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [hasStartedPractice, setHasStartedPractice] = useState(false);
  const { updateGame } = useSettings();
  
  const numberOpacity = useSharedValue(0);
  const numberScale = useSharedValue(0.8);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const step = tutorialSteps[currentStep];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const animatedNumberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ scale: numberScale.value }],
  }));

  const startDemo = () => {
    if (!step.showDemo) return;
    
    setIsPlaying(true);
    setCurrentNumberIndex(0);
    setShowResult(false);
    setUserAnswer('');
    
    showNumbers(step.demoNumbers!);
  };

  const showNumbers = (numbers: number[]) => {
    let index = 0;
    
    const showNext = () => {
      if (index < numbers.length) {
        numberOpacity.value = withSequence(
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        numberScale.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(1.1, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
        
        setCurrentNumberIndex(index);
        index++;
        
        intervalRef.current = setTimeout(() => {
          numberOpacity.value = withTiming(0, { duration: 200 });
          setTimeout(showNext, 300);
        }, step.demoSpeed);
      } else {
        setIsPlaying(false);
        if (step.interactive) {
          setHasStartedPractice(true);
        } else {
          setTimeout(() => setShowResult(true), 1000);
        }
      }
    };

    showNext();
  };

  const resetDemo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentNumberIndex(0);
    setShowResult(false);
    setUserAnswer('');
    setHasStartedPractice(false);
    numberOpacity.value = 0;
    numberScale.value = 0.8;
  };

  const submitAnswer = () => {
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === step.correctAnswer;
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      resetDemo();
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await updateGame({ tutorialCompleted: true });
    router.replace('/onboarding/setup');
  };

  const getCurrentNumber = () => {
    if (step.demoNumbers && currentNumberIndex < step.demoNumbers.length) {
      return step.demoNumbers[currentNumberIndex];
    }
    return null;
  };

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      {/* Header */}
      <YStack alignItems="center" space="$2" marginBottom="$6" paddingTop="$4">
        <H1 color="$green10" textAlign="center">
          Flash Anzan Tutorial
        </H1>
        <Text color="$gray10" textAlign="center" fontSize="$4">
          Step {currentStep + 1} of {tutorialSteps.length}
        </Text>
      </YStack>

      {/* Step Content */}
      <YStack flex={1} space="$4">
        <AnimatedYStack entering={FadeInDown.delay(100)}>
          <H2 color="$color" textAlign="center" marginBottom="$3">
            {step.title}
          </H2>
          <Text color="$gray10" textAlign="center" fontSize="$4" lineHeight="$6">
            {step.content}
          </Text>
        </AnimatedYStack>

        {/* Demo Area */}
        {step.showDemo && (
          <YStack flex={1} alignItems="center" justifyContent="center" space="$4">
            <Card 
              width={250} 
              height={250} 
              justifyContent="center" 
              alignItems="center"
              backgroundColor="$gray1"
              borderColor="$green6"
              borderWidth={2}
            >
              {isPlaying && getCurrentNumber() !== null ? (
                <Animated.View style={animatedNumberStyle}>
                  <AnimatedText fontSize={72} fontWeight="bold" color="$green10">
                    {getCurrentNumber()}
                  </AnimatedText>
                </Animated.View>
              ) : !isPlaying && hasStartedPractice && step.interactive ? (
                <YStack alignItems="center" space="$3">
                  <Text fontSize="$6" color="$color" fontWeight="600">
                    Calculate!
                  </Text>
                  <Text color="$gray10" textAlign="center">
                    What was the sum?
                  </Text>
                </YStack>
              ) : showResult ? (
                <YStack alignItems="center" space="$2">
                  <CheckCircle color="$green10" size="$3" />
                  <Text fontSize="$6" color="$green10" fontWeight="600">
                    Answer: {step.correctAnswer}
                  </Text>
                  {step.interactive && (
                    <Text color="$gray10">
                      Your answer: {userAnswer}
                    </Text>
                  )}
                </YStack>
              ) : (
                <YStack alignItems="center" space="$2">
                  <Text fontSize="$5" color="$gray10">
                    Press Play to start
                  </Text>
                  <Text color="$gray8" fontSize="$3" textAlign="center">
                    Numbers will appear here
                  </Text>
                </YStack>
              )}
            </Card>

            {/* Demo Controls */}
            <XStack space="$3" alignItems="center">
              <Button
                size="$4"
                backgroundColor="$green10"
                color="white"
                onPress={startDemo}
                disabled={isPlaying}
                icon={<Play color="white" size="$1" />}
              >
                {showResult ? 'Play Again' : 'Play Demo'}
              </Button>
              
              <Button
                size="$4"
                backgroundColor="$gray10"
                color="white"
                onPress={resetDemo}
                icon={<RotateCcw color="white" size="$1" />}
              >
                Reset
              </Button>
            </XStack>

            {/* Answer Input for Interactive Step */}
            {step.interactive && hasStartedPractice && !showResult && (
              <AnimatedYStack entering={FadeInDown.delay(200)} alignItems="center" space="$3">
                <Input
                  size="$4"
                  width={150}
                  textAlign="center"
                  fontSize="$5"
                  placeholder="Your answer"
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  keyboardType="numeric"
                />
                <Button
                  size="$4"
                  backgroundColor="$blue10"
                  color="white"
                  onPress={submitAnswer}
                  disabled={!userAnswer}
                  icon={<CheckCircle color="white" size="$1" />}
                >
                  Submit
                </Button>
              </AnimatedYStack>
            )}
          </YStack>
        )}

        {/* Tips for non-demo steps */}
        {!step.showDemo && (
          <Card padding="$4" backgroundColor="$blue2" marginTop="$4">
            <YStack space="$2">
              <Text color="$blue10" fontWeight="600" fontSize="$4">
                💡 Remember:
              </Text>
              <Text color="$blue10" fontSize="$3">
                • Focus on the center of the screen
              </Text>
              <Text color="$blue10" fontSize="$3">
                • Visualize an abacus in your mind
              </Text>
              <Text color="$blue10" fontSize="$3">
                • Start with slower speeds
              </Text>
              <Text color="$blue10" fontSize="$3">
                • Practice makes perfect!
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>

      {/* Navigation */}
      <YStack space="$3" marginTop="$4">
        <Button
          size="$5"
          backgroundColor="$green10"
          color="white"
          onPress={handleNext}
          icon={<ArrowRight color="white" size="$1" />}
          disabled={step.interactive && hasStartedPractice && !showResult}
        >
          {currentStep === tutorialSteps.length - 1 ? 'Complete Tutorial' : 'Next Step'}
        </Button>
        
        <Button
          size="$4"
          backgroundColor="transparent"
          color="$gray10"
          onPress={handleComplete}
        >
          Skip Tutorial
        </Button>
      </YStack>
    </YStack>
  );
}