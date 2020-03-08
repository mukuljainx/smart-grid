import * as React from 'react';
import {
  Container,
  Sidebar,
  Sidenav,
  Nav,
  Dropdown,
  Icon,
  Divider,
} from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

import About from '../../README.md';
import Props from './doc/props.mdx';
import Actions from './doc/actions.mdx';
import Example from './Example';
import './index.scss';

class Docs extends React.Component {
  state = {
    activeKey: 'about',
  };

  handleSelect = (activeKey: string) => {
    this.setState({ activeKey });
  };

  getContent = () => {
    const { activeKey } = this.state;
    const contents: Record<string, React.ReactNode> = {
      about: (
        <Container className="mdx-container">
          <About />
        </Container>
      ),
      'example-basic': <Example />,
      'example-dynamic-height': (
        <Example key="dynamic-height" dynamicRowHeight />
      ),
      'example-pinned': <Example key="pinned" pinned />,
      'doc-props': (
        <Container className="mdx-container">
          <Props />
        </Container>
      ),
      'doc-actions': (
        <Container className="mdx-container">
          <Actions />
        </Container>
      ),
    };

    return contents[activeKey] || null;
  };

  render() {
    return (
      <Container style={{ height: '100%' }}>
        <Sidebar style={{ height: '100%' }}>
          <Sidenav
            appearance="default"
            defaultOpenKeys={['example']}
            activeKey={this.state.activeKey}
            onSelect={this.handleSelect}
            style={{ height: '100%' }}
          >
            <Sidenav.Header>
              <div
                style={{
                  padding: 20,
                  fontSize: 16,
                  paddingBottom: 4,
                }}
              >
                <h4>
                  Smart Grid
                  <a
                    href="https://github.com/mukuljainx/smart-grid"
                    target="_blank"
                  >
                    <Icon
                      style={{
                        fontSize: 'inherit',
                        marginLeft: 8,
                      }}
                      icon="github"
                    />
                  </a>
                </h4>
                <a href="https://badge.fury.io/js/%40crafts%2Fsmart-grid">
                  <img
                    src="https://badge.fury.io/js/%40crafts%2Fsmart-grid.svg"
                    alt="npm version"
                    height="18"
                  />
                </a>
              </div>
              <Divider />
            </Sidenav.Header>
            <Sidenav.Body>
              <Nav>
                <Nav.Item eventKey="about" icon={<Icon icon="dashboard" />}>
                  About
                </Nav.Item>
                <Dropdown
                  eventKey="example"
                  title="Examples"
                  icon={<Icon icon="magic" />}
                >
                  <Dropdown.Item eventKey="example-basic">Basic</Dropdown.Item>
                  <Dropdown.Item eventKey="example-dynamic-height">
                    Dynamic Height
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="example-pinned">
                    Pinned Left Columns
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown
                  eventKey="doc"
                  title="Documentation"
                  icon={<Icon icon="book2" />}
                >
                  <Dropdown.Item eventKey="doc-props">Props</Dropdown.Item>
                  <Dropdown.Item eventKey="doc-actions">Actions</Dropdown.Item>
                </Dropdown>
              </Nav>
            </Sidenav.Body>
          </Sidenav>
        </Sidebar>
        <Container style={{ padding: 16, overflow: 'auto' }}>
          {this.getContent()}
        </Container>
      </Container>
    );
  }
}

export default Docs;
