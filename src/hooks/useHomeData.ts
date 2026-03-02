import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase'; // Yolunu projenize göre kontrol edin

export const useHomeData = (navigation: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isResearcher, setIsResearcher] = useState<boolean>(false);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [userResponses, setUserResponses] = useState<any[]>([]);

  // 1. Yardımcı Fonksiyon: Yaş Grubu Hesaplama
  const calculateAgeGroup = (birthDate: string) => {
    if (!birthDate) return 'Hepsi';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    if (age >= 55) return '55+';
    return 'Dışı';
  };

  // 2. Fonksiyon: Katılım Verilerini Çekme
  const fetchUserResponses = async (userId: string) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('survey_id, status')
      .eq('user_id', userId);

    if (error) {
      console.error("Katılım verisi çekilemedi:", error);
      return [];
    }
    return data || [];
  };

  // 3. Fonksiyon: Uygun Anketleri Filtreleme
  const fetchCompatibleSurveys = async (userProfile: any) => {
    try {
      let { data: allSurveys, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (allSurveys) {
        const userAgeGroup = calculateAgeGroup(userProfile.birth_date);
        const filtered = allSurveys.filter(survey => {
          // Eğer kullanıcı araştırmacıysa her şeyi görebilir (veya kendi anketlerini)
          if (userProfile.is_researcher) return true;

          const genderMatch = survey.target_gender === 'Hepsi' || survey.target_gender === userProfile.gender;
          const ageMatch = survey.target_age_group === 'Hepsi' || survey.target_age_group === userAgeGroup;
          const cityMatch = survey.target_city === 'Hepsi' || survey.target_city === userProfile.city;
          const eduMatch = survey.target_education === 'Hepsi' || survey.target_education === userProfile.education_level;
          const occMatch = !survey.target_occupation ||
            survey.target_occupation.toLowerCase() === userProfile.occupation?.toLowerCase();

          return genderMatch && ageMatch && cityMatch && eduMatch && occMatch;
        });
        return filtered;
      }
      return [];
    } catch (error) {
      console.error("Anket çekme hatası:", error);
      return [];
    }
  };

  // 4. Ana Veri Çekme Fonksiyonu (Dışarıya açıyoruz)
  const fetchData = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setIsResearcher(profile.is_researcher);
          
          const [responses, compatibleSurveys] = await Promise.all([
            fetchUserResponses(user.id),
            fetchCompatibleSurveys(profile)
          ]);

          setUserResponses(responses);
          setSurveys(compatibleSurveys);
        }
      }
    } catch (error) {
      console.error("Başlatma hatası:", error);
      Alert.alert("Hata", "Veriler yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    refreshing,
    isResearcher,
    surveys,
    userResponses,
    fetchData,
    handleSignOut
  };
};