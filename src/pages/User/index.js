import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';

import api from '../../services/api';

import {
    Container,
    Header,
    Avatar,
    Name,
    Bio,
    Stars,
    Starred,
    OwnerAvatar,
    Info,
    Title,
    Author,
} from './styles';

export default class User extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('user').name,
    });

    state = {
        stars: [],
        page: 1,
        user: '',
        refreshing: false,
    };

    async componentDidMount() {
        const { navigation } = this.props;
        const user = navigation.getParam('user');

        this.setState({ loading: true });

        const response = await api.get(
            `/users/${user.login}/starred?per_page=10`,
        );

        this.setState({ stars: response.data, user, loading: false });
    }

    handleNavigate = repository => {
        const { navigation } = this.props;

        navigation.navigate('Repository', { repository });
    };

    loadMore = async () => {
        const { page, user, stars } = this.state;
        if (stars.length < 10) {
            return;
        }
        this.setState({ loading: true });
        const response = await api.get(
            `/users/${user.login}/starred?page=${page + 1}&per_page=10`,
        );

        this.setState({ stars: response.data, page: page + 1, loading: false });
    };

    refreshList = async () => {
        const { user } = this.state;

        this.setState({ loading: true });
        const response = await api.get(
            `/users/${user.login}/starred?per_page=10`,
        );

        this.setState({ stars: response.data, page: 1, loading: false });
    };

    render() {
        const { stars, loading, user, refreshing } = this.state;
        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>
                {loading ? (
                    <ActivityIndicator color="#7159c1" />
                ) : (
                    <Stars
                        data={stars}
                        keyExtractor={star => String(star.id)}
                        onEndReachedThreshold={0.01}
                        onEndReached={this.loadMore}
                        onRefresh={this.refreshList}
                        refreshing={refreshing}
                        renderItem={({ item }) => (
                            <Starred onPress={() => this.handleNavigate(item)}>
                                <OwnerAvatar
                                    source={{ uri: item.owner.avatar_url }}
                                />
                                <Info>
                                    <Title>{item.name}</Title>
                                    <Author>{item.owner.login}</Author>
                                </Info>
                            </Starred>
                        )}
                    />
                )}
            </Container>
        );
    }
}

User.propTypes = {
    navigation: PropTypes.shape({
        getParam: PropTypes.func,
        navigate: PropTypes.func,
    }).isRequired,
};
