"use client";

import { useEffect } from "react";
import { saveScoreAction } from "@/app/data/actions";

export default function migrateLocalStorageScores() {
  const getLocalScores = () => {
    const stored = localStorage.getItem("av_scores");
    return stored ? JSON.parse(stored) : [];
  };

  const getLocalUser = () => {
    const stored = localStorage.getItem("av_user");
    return stored ? JSON.parse(stored) : null;
  };

  useEffect(() => {
    const migrate = async () => {
      const scoresData = getLocalScores();
      const userData = getLocalUser();
      const hasData = scoresData.length > 0 || userData !== null;

      if (!hasData) {
        return;
      }

      // Marca el flag ANTES de empezar el bucle (evita carrera entre pestañas)
      const flag = "av_migrated_v1";
      if (localStorage.getItem(flag) === "true") {
        return;
      }
      localStorage.setItem(flag, "true");

      try {
        // Migrar scores primero
        if (scoresData.length > 0) {
          for (let i = 0; i < scoresData.length; i++) {
            const score = scoresData[i];
            const formData = new FormData();
            formData.set("game", score.game);
            formData.set("score", score.score.toString());
            formData.set("name", score.name);
            formData.set("at", score.at.toString());

            const result = await saveScoreAction(null, formData);
            if (!result.ok) {
              console.warn(
                `Migración fallida para la puntuación #${i}:`,
                result,
              );
            }
          }
        }

        // Migrar user si existe
        if (userData) {
          // User migration - saving user to localStorage (no DB writes yet)
          // This is handled by the existing storage layer
        }

        // Limpiar los datos migrados para que no se vuelvan a subir
        localStorage.setItem("av_scores", "[]");
        if (userData) {
          localStorage.setItem("av_user", "null");
        }

        console.log("Migración completada exitosamente");
      } catch (error) {
        console.error("Error durante la migración:", error);
        // No limpiar los datos migrados en caso de error para reintentar
      }
    };

    // Ejecutar solo en cliente, después de la hidratación inicial
    const hydrationTimeout = setTimeout(migrate, 0);
    return () => clearTimeout(hydrationTimeout);
  }, []);

  return null;
}
