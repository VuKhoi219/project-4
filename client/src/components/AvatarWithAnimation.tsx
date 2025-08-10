import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import React, { useEffect, useState } from "react";

export function AvatarWithAnimation({ avatarUrl, animationUrl,   scale = 1.5 // 🔹 Giá trị mặc định
}: { avatarUrl: string; animationUrl: string;   scale?: number;
}) {
  // Hàm này chỉ được render khi cả 2 đã là string hợp lệ
  const avatar = useGLTF(avatarUrl);
  const animation = useGLTF(animationUrl);
  const { actions } = useAnimations(animation.animations, avatar.scene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = actions[Object.keys(actions)[0]];
      firstAction?.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  return <primitive object={avatar.scene} scale={scale} />;
}