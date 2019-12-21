import { useQuery } from '@apollo/react-hooks';
import React, { useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { FlatGrid } from 'react-native-super-grid';
import Entypo from 'react-native-vector-icons/Entypo';
import { Connections, IconSizes, PollIntervals, PostDimensions } from '../../constants';
import { AppContext } from '../../context';
import { QUERY_USER } from '../../graphql/query';
import { ConnectionsBottomSheet, Header, IconButton, ListEmptyComponent, PostThumbnail, ProfileCard, ProfileScreenPlaceholder } from '../../layout';
import { ThemeColors } from '../../types/theme';
import AboutBottomSheet from './components/AboutBottomSheet';
import EditProfileBottomSheet from './components/EditProfileBottomSheet';
import SettingsBottomSheet from './components/SettingsBottomSheet';
import { sortPostsAscendingTime } from '../../utils/shared';

const ProfileScreen: React.FC = () => {

  const { user, theme } = useContext(AppContext);

  const { data, loading, error } = useQuery(QUERY_USER, {
    variables: { userId: user.id },
    pollInterval: PollIntervals.profile,
    fetchPolicy: 'network-only'
  });

  const editProfileBottomSheetRef = useRef();
  const settingsBottomSheetRef = useRef();
  const followingBottomSheetRef = useRef();
  const followersBottomSheetRef = useRef();
  const aboutBottomSheetRef = useRef();

  // @ts-ignore
  const onFollowingOpen = () => followingBottomSheetRef.current.open();
  // @ts-ignore
  const onFollowersOpen = () => followersBottomSheetRef.current.open();
  // @ts-ignore
  const onEdit = () => editProfileBottomSheetRef.current.open();
  // @ts-ignore
  const onSettings = () => settingsBottomSheetRef.current.open();

  const onAbout = () => {
    // @ts-ignore
    settingsBottomSheetRef.current.close()
    // @ts-ignore
    aboutBottomSheetRef.current.open();
  }

  const ListHeaderComponent = () => {
    const { user: { avatar, following, followers, name, handle, about } } = data;
    return (
      <ProfileCard
        editable
        onEdit={onEdit}
        onFollowingOpen={onFollowingOpen}
        onFollowersOpen={onFollowersOpen}
        avatar={avatar}
        following={following.length}
        followers={followers.length}
        name={name}
        handle={handle}
        about={about}
      />
    );
  };

  const renderItem = ({ item }) => {
    const { id, uri } = item;
    return (
      <PostThumbnail
        id={id}
        uri={uri}
        dimensions={PostDimensions.Medium}
      />
    );
  };

  let content = <ProfileScreenPlaceholder />;

  if (!loading && !error) {
    const { user: { avatar, name, handle, following, followers, about, posts } } = data;
    const sortedPosts = sortPostsAscendingTime(posts);
    content = (
      <>
        <FlatGrid
          staticDimension={responsiveWidth(94)}
          ListHeaderComponent={ListHeaderComponent}
          itemDimension={150}
          items={sortedPosts}
          ListEmptyComponent={() => <ListEmptyComponent listType='posts' spacing={30} />}
          style={styles().postGrid}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
        <ConnectionsBottomSheet
          ref={followingBottomSheetRef}
          data={following}
          type={Connections.FOLLOWING}
        />
        <ConnectionsBottomSheet
          ref={followersBottomSheetRef}
          data={followers}
          type={Connections.FOLLOWERS}
        />
        <EditProfileBottomSheet
          ref={editProfileBottomSheetRef}
          avatar={avatar}
          name={name}
          handle={handle}
          about={about}
        />
      </>
    );
  }

  const IconRight = () => <IconButton
    onPress={onSettings}
    Icon={() => <Entypo
      name='dots-three-vertical'
      size={IconSizes.x5}
      color={theme.text01}
    />}
  />;

  return (
    <View style={styles(theme).container}>
      <Header
        title='My Profile'
        IconRight={IconRight}
      />
      {content}
      <AboutBottomSheet ref={aboutBottomSheetRef} />
      <SettingsBottomSheet ref={settingsBottomSheetRef} onAboutPress={onAbout} />
    </View>
  );
};

const styles = (theme = {} as ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base
  },
  postGrid: {
    flex: 1,
    marginHorizontal: 10
  }
});

export default ProfileScreen;