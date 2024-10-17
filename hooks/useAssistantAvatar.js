import { useRoute } from '@react-navigation/native';

export function useAssistantAvatar () {
  const route = useRoute();
  const chatScene = route.params?.scene;

  const getAvatar = (scene = chatScene) => {
    if (scene === 'talk') {
      return require('../assets/images/guagua.jpg');
    } else if (scene === 'exercises') {
      return require('../assets/images/doudou.jpg');
    }
  }

  return {
    avatar: getAvatar(),
    getAvatar,
  };
}
